package lk.ecocycle.backend.tracking.dto;

import lk.ecocycle.backend.truck.CollectionRoute;
import lk.ecocycle.backend.truck.RouteStatus;
import lk.ecocycle.backend.truck.Truck;
import org.locationtech.jts.geom.Point;

import java.time.Instant;

// Where a truck is now. Sent over the WebSocket and returned by the fleet API.
// The route fields are empty when the truck is not on a route.
public record TruckPosition(
        Long truckId,
        String registrationNumber,
        String councilName,
        Long routeId,
        RouteStatus routeStatus,
        Long wardId,
        String wardName,
        String driverName,
        Double latitude,
        Double longitude,
        Double speedKmh,
        Double heading,
        Instant lastSeenAt
) {
    public static TruckPosition from(CollectionRoute route) {
        return of(route.getTruck(), route);
    }

    // route can be null
    public static TruckPosition of(Truck truck, CollectionRoute route) {
        Point point = truck.getLastLocation();
        return new TruckPosition(
                truck.getId(),
                truck.getRegistrationNumber(),
                truck.getCouncil().getName(),
                route == null ? null : route.getId(),
                route == null ? null : route.getStatus(),
                route == null ? null : route.getWard().getId(),
                route == null ? null : route.getWard().getName(),
                route == null ? null : route.getDriver().getFullName(),
                point == null ? null : point.getY(),
                point == null ? null : point.getX(),
                truck.getLastSpeedKmh(),
                truck.getLastHeading(),
                truck.getLastSeenAt()
        );
    }
}