package lk.ecocycle.backend.tracking.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

// Sent by the driver's phone every few seconds while a route is in progress
public record LocationUpdateRequest(
        @NotNull(message = "Latitude is required")
        Double latitude,

        @NotNull(message = "Longitude is required")
        Double longitude,

        // Optional (the phone may not know)
        @DecimalMin("0") @DecimalMax("200")
        Double speedKmh,

        // Optional: 0 = north, 90 = east
        @DecimalMin("0") @DecimalMax("360")
        Double heading
) {
}