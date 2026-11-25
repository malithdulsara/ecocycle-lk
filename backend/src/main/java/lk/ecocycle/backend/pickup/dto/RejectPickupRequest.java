package lk.ecocycle.backend.pickup.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RejectPickupRequest(
        @NotBlank(message = "Reason is required")
        @Size(max = 255)
        String reason
) {
}