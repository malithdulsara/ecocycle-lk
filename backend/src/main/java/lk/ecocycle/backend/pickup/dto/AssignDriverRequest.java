package lk.ecocycle.backend.pickup.dto;

import jakarta.validation.constraints.NotNull;

public record AssignDriverRequest(
        @NotNull(message = "Driver is required")
        Long driverId
) {
}