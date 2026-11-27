package lk.ecocycle.backend.tracking;

import lk.ecocycle.backend.tracking.dto.LocationUpdateRequest;
import lk.ecocycle.backend.tracking.dto.TrailPoint;
import lk.ecocycle.backend.tracking.dto.TruckPosition;
import lk.ecocycle.backend.tracking.dto.WardTrucksResponse;

import java.util.List;

public interface TrackingService {

    // Driver: save the phone's GPS point and send it to the live maps
    TruckPosition updateLocation(Long driverId, LocationUpdateRequest request);

    // Council officer / admin: every active truck and where it was last seen
    List<TruckPosition> getFleet();

    // Household: trucks working in their ward now, with a rough arrival time
    WardTrucksResponse getMyWardTrucks(Long userId);

    List<TrailPoint> getTrail(Long routeId);
}