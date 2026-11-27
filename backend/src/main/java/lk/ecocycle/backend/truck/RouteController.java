package lk.ecocycle.backend.truck;

import jakarta.validation.Valid;
import lk.ecocycle.backend.common.ApiResponse;
import lk.ecocycle.backend.tracking.TrackingService;
import lk.ecocycle.backend.tracking.dto.TrailPoint;
import lk.ecocycle.backend.truck.dto.RouteRequest;
import lk.ecocycle.backend.truck.dto.RouteResponse;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/routes")
public class RouteController {

    private static final String STAFF = "hasAnyRole('ADMIN', 'COUNCIL_OFFICER')";

    private final RouteService routeService;
    private final TrackingService trackingService;

    public RouteController(RouteService routeService, TrackingService trackingService) {
        this.routeService = routeService;
        this.trackingService = trackingService;
    }

    // ---------- Council officer / admin ----------

    // ?date=2026-11-27
    @GetMapping
    @PreAuthorize(STAFF)
    public ApiResponse<List<RouteResponse>> getByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ApiResponse.ok(routeService.getByDate(date));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize(STAFF)
    public ApiResponse<RouteResponse> create(@Valid @RequestBody RouteRequest request) {
        return ApiResponse.ok("Route planned", routeService.create(request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(STAFF)
    public ApiResponse<Void> delete(@PathVariable Long id) {
        routeService.delete(id);
        return ApiResponse.ok("Route deleted", null);
    }

    // The GPS points the truck sent on this route (the line on the map)
    @GetMapping("/{id}/trail")
    @PreAuthorize(STAFF)
    public ApiResponse<List<TrailPoint>> getTrail(@PathVariable Long id) {
        return ApiResponse.ok(trackingService.getTrail(id));
    }

    // ---------- Driver ----------

    @GetMapping("/my")
    @PreAuthorize("hasRole('DRIVER')")
    public ApiResponse<List<RouteResponse>> getMyToday(Authentication auth) {
        return ApiResponse.ok(routeService.getMyToday(userId(auth)));
    }

    @PostMapping("/{id}/start")
    @PreAuthorize("hasRole('DRIVER')")
    public ApiResponse<RouteResponse> start(Authentication auth, @PathVariable Long id) {
        return ApiResponse.ok("Route started", routeService.start(userId(auth), id));
    }

    @PostMapping("/{id}/finish")
    @PreAuthorize("hasRole('DRIVER')")
    public ApiResponse<RouteResponse> finish(Authentication auth, @PathVariable Long id) {
        return ApiResponse.ok("Route finished", routeService.finish(userId(auth), id));
    }

    // The token's "sub" claim is the user id
    private Long userId(Authentication auth) {
        return Long.valueOf(auth.getName());
    }
}