package lk.ecocycle.backend.recycling.dto;

import jakarta.validation.constraints.Size;

public record ReviewRequest(
        // Required when rejecting, optional when approving
        @Size(max = 255)
        String note
) {
}