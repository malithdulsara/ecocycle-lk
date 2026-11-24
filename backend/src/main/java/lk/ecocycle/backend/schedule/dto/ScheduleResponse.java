package lk.ecocycle.backend.schedule.dto;

import lk.ecocycle.backend.schedule.CollectionSchedule;
import lk.ecocycle.backend.wastetype.dto.WasteTypeResponse;

import java.time.DayOfWeek;
import java.time.LocalTime;

public record ScheduleResponse(
        Long id,
        Long wardId,
        WasteTypeResponse wasteType,
        DayOfWeek dayOfWeek,
        LocalTime startTime,
        LocalTime endTime,
        String notes
) {
    public static ScheduleResponse from(CollectionSchedule schedule) {
        return new ScheduleResponse(
                schedule.getId(),
                schedule.getWard().getId(),
                WasteTypeResponse.from(schedule.getWasteType()),
                schedule.getDayOfWeek(),
                schedule.getStartTime(),
                schedule.getEndTime(),
                schedule.getNotes()
        );
    }
}