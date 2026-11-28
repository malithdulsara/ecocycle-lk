package lk.ecocycle.backend.recycling.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record RateRequest(
        @NotNull(message = "Points per kg is required")
        @DecimalMin(value = "0.1", message = "Points per kg must be at least 0.1")
        @DecimalMax(value = "1000", message = "Points per kg must be 1000 or less")
        @Digits(integer = 4, fraction = 2, message = "Use at most 2 decimal places")
        BigDecimal pointsPerKg
) {
}