package lk.ecocycle.backend.reward.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RewardRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 100)
        String name,

        @Size(max = 255)
        String description,

        @NotNull(message = "Points are required")
        @Min(value = 1, message = "Points must be at least 1")
        @Max(value = 1000000, message = "Points must be 1,000,000 or less")
        Integer pointsCost,

        // Optional: empty = no limit
        @Min(value = 0, message = "Stock cannot be negative")
        @Max(value = 100000, message = "Stock must be 100,000 or less")
        Integer stock,

        // Optional on create (default true). false = hidden from households
        Boolean active
) {
}