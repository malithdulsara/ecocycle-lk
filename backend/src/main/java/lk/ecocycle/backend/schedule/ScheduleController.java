package lk.ecocycle.backend.schedule;

import jakarta.validation.Valid;
import lk.ecocycle.backend.common.ApiResponse;
import lk.ecocycle.backend.schedule.dto.ScheduleChangeRequest;
import lk.ecocycle.backend.schedule.dto.ScheduleChangeResponse;
import lk.ecocycle.backend.schedule.dto.ScheduleRequest;
import lk.ecocycle.backend.schedule.dto.ScheduleResponse;
import lk.ecocycle.backend.schedule.dto.WardCollectionsResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class ScheduleController {

    private static final String STAFF = "hasAnyRole('ADMIN', 'COUNCIL_OFFICER')";

    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    // ---------- Weekly schedules ----------

    // Public
    @GetMapping("/wards/{wardId}/schedules")
    public ApiResponse<List<ScheduleResponse>> getWardSchedules(@PathVariable Long wardId) {
        return ApiResponse.ok(scheduleService.getWardSchedules(wardId));
    }

    @PostMapping("/wards/{wardId}/schedules")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize(STAFF)
    public ApiResponse<ScheduleResponse> create(@PathVariable Long wardId,
                                                @Valid @RequestBody ScheduleRequest request) {
        return ApiResponse.ok("Schedule added", scheduleService.create(wardId, request));
    }

    @PutMapping("/schedules/{id}")
    @PreAuthorize(STAFF)
    public ApiResponse<ScheduleResponse> update(@PathVariable Long id,
                                                @Valid @RequestBody ScheduleRequest request) {
        return ApiResponse.ok("Schedule updated", scheduleService.update(id, request));
    }

    @DeleteMapping("/schedules/{id}")
    @PreAuthorize(STAFF)
    public ApiResponse<Void> delete(@PathVariable Long id) {
        scheduleService.delete(id);
        return ApiResponse.ok("Schedule deleted", null);
    }

    // ---------- Holiday changes ----------

    // Public
    @GetMapping("/councils/{councilId}/schedule-changes")
    public ApiResponse<List<ScheduleChangeResponse>> getChanges(@PathVariable Long councilId) {
        return ApiResponse.ok(scheduleService.getUpcomingChanges(councilId));
    }

    @PostMapping("/councils/{councilId}/schedule-changes")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize(STAFF)
    public ApiResponse<ScheduleChangeResponse> createChange(@PathVariable Long councilId,
                                                            @Valid @RequestBody ScheduleChangeRequest request) {
        return ApiResponse.ok("Schedule change added", scheduleService.createChange(councilId, request));
    }

    @DeleteMapping("/schedule-changes/{id}")
    @PreAuthorize(STAFF)
    public ApiResponse<Void> deleteChange(@PathVariable Long id) {
        scheduleService.deleteChange(id);
        return ApiResponse.ok("Schedule change deleted", null);
    }

    // ---------- Upcoming collections ----------

    // Public: guests pick a ward and see the next collections
    @GetMapping("/wards/{wardId}/collections/upcoming")
    public ApiResponse<WardCollectionsResponse> getUpcoming(@PathVariable Long wardId,
                                                            @RequestParam(defaultValue = "14") int days) {
        return ApiResponse.ok(scheduleService.getUpcomingCollections(wardId, days));
    }

    // Logged-in user: uses the ward of their home address
    @GetMapping("/schedules/my")
    public ApiResponse<WardCollectionsResponse> getMine(@AuthenticationPrincipal Jwt jwt,
                                                        @RequestParam(defaultValue = "14") int days) {
        return ApiResponse.ok(scheduleService.getMyUpcomingCollections(Long.valueOf(jwt.getSubject()), days));
    }
}