package lk.ecocycle.backend.schedule;

import lk.ecocycle.backend.schedule.dto.ScheduleChangeRequest;
import lk.ecocycle.backend.schedule.dto.ScheduleChangeResponse;
import lk.ecocycle.backend.schedule.dto.ScheduleRequest;
import lk.ecocycle.backend.schedule.dto.ScheduleResponse;
import lk.ecocycle.backend.schedule.dto.WardCollectionsResponse;

import java.util.List;

public interface ScheduleService {

    // Weekly timetable of a ward
    List<ScheduleResponse> getWardSchedules(Long wardId);

    ScheduleResponse create(Long wardId, ScheduleRequest request);

    ScheduleResponse update(Long scheduleId, ScheduleRequest request);

    void delete(Long scheduleId);

    // Holiday changes from today onwards
    List<ScheduleChangeResponse> getUpcomingChanges(Long councilId);

    ScheduleChangeResponse createChange(Long councilId, ScheduleChangeRequest request);

    void deleteChange(Long changeId);

    // Real collection dates for the next N days, holiday changes applied
    WardCollectionsResponse getUpcomingCollections(Long wardId, int days);

    // Same, for the ward of the logged-in user's default address
    WardCollectionsResponse getMyUpcomingCollections(Long userId, int days);
}