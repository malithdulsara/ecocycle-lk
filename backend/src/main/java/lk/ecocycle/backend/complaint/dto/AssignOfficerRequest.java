package lk.ecocycle.backend.complaint.dto;

import jakarta.validation.constraints.NotNull;
import lk.ecocycle.backend.complaint.ComplaintPriority;

public record AssignOfficerRequest(
        @NotNull(message = "Officer is required")
        Long officerId,

        // Optional: change the priority (this also moves the SLA deadline)
        ComplaintPriority priority
) {
}