package lk.ecocycle.backend.schedule.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.DayOfWeek;
import java.time.LocalTime;

public record ScheduleRequest(
        @NotNull(message = "Waste type is required")
        Long wasteTypeId,

        // MONDAY, TUESDAY, ... SUNDAY
        @NotNull(message = "Day is required")
        DayOfWeek dayOfWeek,

        // "07:00"
        @NotNull(message = "Start time is required")
        LocalTime startTime,

        @NotNull(message = "End time is required")
        LocalTime endTime,

        @Size(max = 255)
        String notes
) {
}