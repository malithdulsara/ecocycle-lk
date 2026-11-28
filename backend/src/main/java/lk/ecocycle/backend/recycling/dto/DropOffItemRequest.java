package lk.ecocycle.backend.recycling.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record DropOffItemRequest(
        @NotNull(message = "Material is required")
        Long wasteTypeId,

        // From the scale, e.g. 2.35
        @NotNull(message = "Weight is required")
        @DecimalMin(value = "0.1", message = "Weight must be at least 0.1 kg")
        @DecimalMax(value = "500", message = "Weight must be 500 kg or less")
        @Digits(integer = 3, fraction = 2, message = "Use at most 2 decimal places for the weight")
        BigDecimal weightKg
) {
}