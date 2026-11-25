package lk.ecocycle.backend.pickup.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ApprovePickupRequest(
        // The day the council will collect it
        @NotNull(message = "Collection date is required")
        LocalDate scheduledDate,

        // Optional message for the household, e.g. "Keep items near the gate"
        @Size(max = 255)
        String note
) {
}