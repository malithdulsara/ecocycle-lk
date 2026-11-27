package lk.ecocycle.backend.truck;

import lk.ecocycle.backend.common.exception.BadRequestException;
import lk.ecocycle.backend.common.exception.ResourceNotFoundException;
import lk.ecocycle.backend.tracking.FleetBroadcaster;
import lk.ecocycle.backend.tracking.dto.TruckPosition;
import lk.ecocycle.backend.truck.dto.RouteRequest;
import lk.ecocycle.backend.truck.dto.RouteResponse;
import lk.ecocycle.backend.user.Role;
import lk.ecocycle.backend.user.User;
import lk.ecocycle.backend.user.UserRepository;
import lk.ecocycle.backend.ward.Ward;
import lk.ecocycle.backend.ward.WardRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service
@Transactional
public class RouteServiceImpl implements RouteService {

    private static final ZoneId SRI_LANKA = ZoneId.of("Asia/Colombo");

    private final CollectionRouteRepository routeRepository;
    private final TruckRepository truckRepository;
    private final UserRepository userRepository;
    private final WardRepository wardRepository;
    private final FleetBroadcaster broadcaster;

    public RouteServiceImpl(CollectionRouteRepository routeRepository,
                            TruckRepository truckRepository,
                            UserRepository userRepository,
                            WardRepository wardRepository,
                            FleetBroadcaster broadcaster) {
        this.routeRepository = routeRepository;
        this.truckRepository = truckRepository;
        this.userRepository = userRepository;
        this.wardRepository = wardRepository;
        this.broadcaster = broadcaster;
    }

    // ---------- Council officer / admin ----------

    @Override
    @Transactional(readOnly = true)
    public List<RouteResponse> getByDate(LocalDate date) {
        return routeRepository.findByRouteDateOrderByIdAsc(date).stream()
                .map(RouteResponse::from)
                .toList();
    }

    @Override
    public RouteResponse create(RouteRequest request) {
        if (request.routeDate().isBefore(today())) {
            throw new BadRequestException("Route date cannot be in the past");
        }
        Truck truck = truckRepository.findById(request.truckId())
                .orElseThrow(() -> new ResourceNotFoundException("Truck not found"));
        if (!truck.isActive()) {
            throw new BadRequestException("This truck is not in use");
        }
        Ward ward = wardRepository.findById(request.wardId())
                .orElseThrow(() -> new ResourceNotFoundException("Ward not found"));
        if (!ward.getCouncil().getId().equals(truck.getCouncil().getId())) {
            throw new BadRequestException("The truck belongs to another council");
        }
        User driver = userRepository.findById(request.driverId())
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));
        if (driver.getRole() != Role.DRIVER || !driver.isEnabled()) {
            throw new BadRequestException("Choose an active driver");
        }
        if (routeRepository.existsByTruckIdAndWardIdAndRouteDate(truck.getId(), ward.getId(), request.routeDate())) {
            throw new BadRequestException("This truck already has a route in this ward on that day");
        }

        CollectionRoute route = new CollectionRoute();
        route.setRouteDate(request.routeDate());
        route.setTruck(truck);
        route.setDriver(driver);
        route.setWard(ward);
        return RouteResponse.from(routeRepository.save(route));
    }

    @Override
    public void delete(Long routeId) {
        CollectionRoute route = find(routeId);
        if (route.getStatus() != RouteStatus.PLANNED) {
            throw new BadRequestException("Only planned routes can be deleted");
        }
        routeRepository.delete(route);
    }

    // ---------- Driver ----------

    @Override
    @Transactional(readOnly = true)
    public List<RouteResponse> getMyToday(Long driverId) {
        return routeRepository.findByDriverIdAndRouteDateOrderByIdAsc(driverId, today()).stream()
                .map(RouteResponse::from)
                .toList();
    }

    @Override
    public RouteResponse start(Long driverId, Long routeId) {
        CollectionRoute route = findOwnRoute(driverId, routeId);
        if (route.getStatus() != RouteStatus.PLANNED) {
            throw new BadRequestException("This route has already been started");
        }
        if (!route.getRouteDate().equals(today())) {
            throw new BadRequestException("You can only start today's routes");
        }
        if (routeRepository.findFirstByDriverIdAndStatus(driverId, RouteStatus.IN_PROGRESS).isPresent()) {
            throw new BadRequestException("Finish your current route first");
        }
        if (routeRepository.existsByTruckIdAndStatus(route.getTruck().getId(), RouteStatus.IN_PROGRESS)) {
            throw new BadRequestException("This truck is already on another route");
        }
        route.setStatus(RouteStatus.IN_PROGRESS);
        route.setStartedAt(Instant.now());
        broadcaster.publish(TruckPosition.from(route));
        return RouteResponse.from(route);
    }

    @Override
    public RouteResponse finish(Long driverId, Long routeId) {
        CollectionRoute route = findOwnRoute(driverId, routeId);
        if (route.getStatus() != RouteStatus.IN_PROGRESS) {
            throw new BadRequestException("Only a route in progress can be finished");
        }
        route.setStatus(RouteStatus.COMPLETED);
        route.setFinishedAt(Instant.now());
        // Maps remove the truck when they get a COMPLETED message
        broadcaster.publish(TruckPosition.from(route));
        return RouteResponse.from(route);
    }

    // ---------- Helpers ----------

    private CollectionRoute find(Long routeId) {
        return routeRepository.findWithDetailsById(routeId)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found"));
    }

    // A driver can only see and change their own routes
    private CollectionRoute findOwnRoute(Long driverId, Long routeId) {
        CollectionRoute route = find(routeId);
        if (!route.getDriver().getId().equals(driverId)) {
            throw new ResourceNotFoundException("Route not found");
        }
        return route;
    }

    private LocalDate today() {
        return LocalDate.now(SRI_LANKA);
    }
}