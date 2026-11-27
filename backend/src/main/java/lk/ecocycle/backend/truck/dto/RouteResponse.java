package lk.ecocycle.backend.truck.dto;

import lk.ecocycle.backend.truck.CollectionRoute;
import lk.ecocycle.backend.truck.RouteStatus;

import java.time.Instant;
import java.time.LocalDate;

public record RouteResponse(
        Long id,
        LocalDate routeDate,
        RouteStatus status,
        Long truckId,
        String registrationNumber,
        Long driverId,
        String driverName,
        Long wardId,
        String wardName,
        String councilName,
        Instant startedAt,
        Instant finishedAt
) {
    public static RouteResponse from(CollectionRoute route) {
        return new RouteResponse(
                route.getId(),
                route.getRouteDate(),
                route.getStatus(),
                route.getTruck().getId(),
                route.getTruck().getRegistrationNumber(),
                route.getDriver().getId(),
                route.getDriver().getFullName(),
                route.getWard().getId(),
                route.getWard().getName(),
                route.getWard().getCouncil().getName(),
                route.getStartedAt(),
                route.getFinishedAt()
        );
    }
}