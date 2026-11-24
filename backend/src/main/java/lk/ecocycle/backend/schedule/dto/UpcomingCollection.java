package lk.ecocycle.backend.schedule.dto;

import lk.ecocycle.backend.schedule.CollectionStatus;
import lk.ecocycle.backend.wastetype.dto.WasteTypeResponse;

import java.time.LocalDate;
import java.time.LocalTime;

// One collection on one real date (holiday changes already applied)
public record UpcomingCollection(
        LocalDate date,
        LocalDate originalDate, // only set when the collection was moved
        WasteTypeResponse wasteType,
        LocalTime startTime,
        LocalTime endTime,
        CollectionStatus status,
        String note
) {
}