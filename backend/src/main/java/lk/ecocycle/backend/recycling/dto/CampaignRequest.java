package lk.ecocycle.backend.recycling.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CampaignRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 100)
        String name,

        @Size(max = 255)
        String description,

        // 1.5 = 50% more points, 2 = double points
        @NotNull(message = "Multiplier is required")
        @DecimalMin(value = "1.1", message = "Multiplier must be at least 1.1")
        @DecimalMax(value = "5", message = "Multiplier must be 5 or less")
        @Digits(integer = 1, fraction = 1, message = "Use one decimal place, e.g. 1.5")
        BigDecimal multiplier,

        // Optional: empty = every material
        Long wasteTypeId,

        @NotNull(message = "Start date is required")
        LocalDate startDate,

        @NotNull(message = "End date is required")
        LocalDate endDate,

        // Optional on create (default true). false = stopped early
        Boolean active
) {
}