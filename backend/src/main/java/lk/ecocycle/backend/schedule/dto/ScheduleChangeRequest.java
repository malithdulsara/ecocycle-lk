package lk.ecocycle.backend.schedule.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lk.ecocycle.backend.schedule.ChangeType;

import java.time.LocalDate;

public record ScheduleChangeRequest(
        // "2026-12-25"
        @NotNull(message = "Date is required")
        LocalDate changeDate,

        @NotNull(message = "Change type is required")
        ChangeType changeType,

        // Required when changeType is RESCHEDULED
        LocalDate newDate,

        @NotBlank(message = "Reason is required (e.g. Poya day)")
        @Size(max = 255)
        String reason
) {
}