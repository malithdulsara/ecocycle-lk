package lk.ecocycle.backend.truck;

import lk.ecocycle.backend.truck.dto.RouteRequest;
import lk.ecocycle.backend.truck.dto.RouteResponse;

import java.time.LocalDate;
import java.util.List;

public interface RouteService {

    // ----- Council officer / admin -----

    List<RouteResponse> getByDate(LocalDate date);

    RouteResponse create(RouteRequest request);

    // Only planned routes can be deleted
    void delete(Long routeId);

    // ----- Driver -----

    // The driver's routes for today
    List<RouteResponse> getMyToday(Long driverId);

    RouteResponse start(Long driverId, Long routeId);

    RouteResponse finish(Long driverId, Long routeId);
}