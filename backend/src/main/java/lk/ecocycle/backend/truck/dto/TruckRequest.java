package lk.ecocycle.backend.truck.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TruckRequest(
        // e.g. "WP LB-1234" or "LB-1234"
        @NotBlank(message = "Registration number is required")
        @Size(max = 20)
        String registrationNumber,

        // Optional, e.g. "Isuzu compactor"
        @Size(max = 100)
        String model,

        @NotNull(message = "Capacity is required")
        @Min(value = 100, message = "Capacity must be at least 100 kg")
        @Max(value = 50000, message = "Capacity must be 50,000 kg or less")
        Integer capacityKg,

        @NotNull(message = "Council is required")
        Long councilId,

        // Optional on create (default true). false = truck is not in use
        Boolean active
) {
}