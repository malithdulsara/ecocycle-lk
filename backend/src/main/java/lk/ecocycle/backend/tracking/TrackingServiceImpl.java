package lk.ecocycle.backend.tracking;

import lk.ecocycle.backend.address.Address;
import lk.ecocycle.backend.address.AddressRepository;
import lk.ecocycle.backend.common.exception.BadRequestException;
import lk.ecocycle.backend.common.exception.ResourceNotFoundException;
import lk.ecocycle.backend.common.geo.GeoUtils;
import lk.ecocycle.backend.tracking.dto.LocationUpdateRequest;
import lk.ecocycle.backend.tracking.dto.TrailPoint;
import lk.ecocycle.backend.tracking.dto.TruckEta;
import lk.ecocycle.backend.tracking.dto.TruckPosition;
import lk.ecocycle.backend.tracking.dto.WardTrucksResponse;
import lk.ecocycle.backend.truck.CollectionRoute;
import lk.ecocycle.backend.truck.CollectionRouteRepository;
import lk.ecocycle.backend.truck.RouteStatus;
import lk.ecocycle.backend.truck.Truck;
import lk.ecocycle.backend.truck.TruckRepository;
import lk.ecocycle.backend.ward.Ward;
import org.locationtech.jts.geom.Point;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class TrackingServiceImpl implements TrackingService {

    private final CollectionRouteRepository routeRepository;
    private final TruckRepository truckRepository;
    private final TruckLocationRepository locationRepository;
    private final AddressRepository addressRepository;
    private final FleetBroadcaster broadcaster;

    public TrackingServiceImpl(CollectionRouteRepository routeRepository,
                               TruckRepository truckRepository,
                               TruckLocationRepository locationRepository,
                               AddressRepository addressRepository,
                               FleetBroadcaster broadcaster) {
        this.routeRepository = routeRepository;
        this.truckRepository = truckRepository;
        this.locationRepository = locationRepository;
        this.addressRepository = addressRepository;
        this.broadcaster = broadcaster;
    }

    @Override
    @Transactional
    public TruckPosition updateLocation(Long driverId, LocationUpdateRequest request) {
        CollectionRoute route = routeRepository.findFirstByDriverIdAndStatus(driverId, RouteStatus.IN_PROGRESS)
                .orElseThrow(() -> new BadRequestException("Start a route before sharing your location"));
        Point point = GeoUtils.toPoint(request.latitude(), request.longitude());
        Instant now = Instant.now();

        // 1) keep the point for the trail
        TruckLocation location = new TruckLocation();
        location.setTruck(route.getTruck());
        location.setRoute(route);
        location.setLocation(point);
        location.setSpeedKmh(request.speedKmh());
        location.setHeading(request.heading());
        location.setRecordedAt(now);
        locationRepository.save(location);

        // 2) remember it as the truck's latest position
        Truck truck = route.getTruck();
        truck.setLastLocation(point);
        truck.setLastSpeedKmh(request.speedKmh());
        truck.setLastHeading(request.heading());
        truck.setLastSeenAt(now);

        // 3) tell the live maps
        TruckPosition position = TruckPosition.from(route);
        broadcaster.publish(position);
        return position;
    }

    @Override
    public List<TruckPosition> getFleet() {
        // Trucks on a route right now, by truck id
        Map<Long, CollectionRoute> activeRoutes = routeRepository.findByStatus(RouteStatus.IN_PROGRESS).stream()
                .collect(Collectors.toMap(r -> r.getTruck().getId(), Function.identity(), (a, b) -> a));
        return truckRepository.findByActiveTrueOrderByRegistrationNumberAsc().stream()
                .map(truck -> TruckPosition.of(truck, activeRoutes.get(truck.getId())))
                .toList();
    }

    @Override
    public WardTrucksResponse getMyWardTrucks(Long userId) {
        List<Address> addresses = addressRepository.findByUserIdOrderByCreatedAtAsc(userId);
        if (addresses.isEmpty()) {
            throw new BadRequestException("Add your home address first to see the truck");
        }
        Address home = addresses.stream()
                .filter(Address::isDefaultAddress)
                .findFirst()
                .orElse(addresses.getFirst());
        Ward ward = home.getWard();
        if (ward == null) {
            throw new BadRequestException("Your address is outside all council wards we serve");
        }
        double homeLat = home.getLocation().getY();
        double homeLng = home.getLocation().getX();

        List<TruckEta> trucks = routeRepository.findByWardIdAndStatus(ward.getId(), RouteStatus.IN_PROGRESS).stream()
                .map(route -> toEta(TruckPosition.from(route), homeLat, homeLng))
                // Nearest truck first (trucks with no GPS yet go last)
                .sorted(Comparator.comparing(TruckEta::distanceKm, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
        return new WardTrucksResponse(ward.getId(), ward.getName(), homeLat, homeLng, trucks);
    }

    @Override
    public List<TrailPoint> getTrail(Long routeId) {
        if (!routeRepository.existsById(routeId)) {
            throw new ResourceNotFoundException("Route not found");
        }
        return locationRepository.findByRouteIdOrderByRecordedAtAsc(routeId).stream()
                .map(l -> new TrailPoint(l.getLocation().getY(), l.getLocation().getX(), l.getRecordedAt()))
                .toList();
    }

    private TruckEta toEta(TruckPosition position, double homeLat, double homeLng) {
        if (position.latitude() == null || position.longitude() == null) {
            return new TruckEta(position, null, null);
        }
        double distance = EtaCalculator.distanceKm(position.latitude(), position.longitude(), homeLat, homeLng);
        return new TruckEta(position, Math.round(distance * 100) / 100.0, EtaCalculator.etaMinutes(distance));
    }
}