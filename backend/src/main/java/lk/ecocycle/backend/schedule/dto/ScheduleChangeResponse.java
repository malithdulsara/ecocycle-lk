package lk.ecocycle.backend.schedule.dto;

import lk.ecocycle.backend.schedule.ChangeType;
import lk.ecocycle.backend.schedule.ScheduleChange;

import java.time.LocalDate;

public record ScheduleChangeResponse(
        Long id,
        Long councilId,
        LocalDate changeDate,
        ChangeType changeType,
        LocalDate newDate,
        String reason
) {
    public static ScheduleChangeResponse from(ScheduleChange change) {
        return new ScheduleChangeResponse(
                change.getId(),
                change.getCouncil().getId(),
                change.getChangeDate(),
                change.getChangeType(),
                change.getNewDate(),
                change.getReason()
        );
    }
}