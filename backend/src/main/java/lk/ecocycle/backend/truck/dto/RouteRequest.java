package lk.ecocycle.backend.truck.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record RouteRequest(
        // "2026-11-27"
        @NotNull(message = "Date is required")
        LocalDate routeDate,

        @NotNull(message = "Truck is required")
        Long truckId,

        @NotNull(message = "Driver is required")
        Long driverId,

        @NotNull(message = "Ward is required")
        Long wardId
) {
}