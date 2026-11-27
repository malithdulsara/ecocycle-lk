package lk.ecocycle.backend.tracking;

import jakarta.validation.Valid;
import lk.ecocycle.backend.common.ApiResponse;
import lk.ecocycle.backend.tracking.dto.LocationUpdateRequest;
import lk.ecocycle.backend.tracking.dto.TruckPosition;
import lk.ecocycle.backend.tracking.dto.WardTrucksResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tracking")
public class TrackingController {

    private final TrackingService trackingService;

    public TrackingController(TrackingService trackingService) {
        this.trackingService = trackingService;
    }

    // Driver's phone: send the current GPS position (every few seconds while on a route)
    @PostMapping("/location")
    @PreAuthorize("hasRole('DRIVER')")
    public ApiResponse<TruckPosition> updateLocation(Authentication auth,
                                                     @Valid @RequestBody LocationUpdateRequest request) {
        return ApiResponse.ok(trackingService.updateLocation(Long.valueOf(auth.getName()), request));
    }

    // Council officer / admin: every truck for the fleet map (live updates come over the WebSocket)
    @GetMapping("/fleet")
    @PreAuthorize("hasAnyRole('ADMIN', 'COUNCIL_OFFICER')")
    public ApiResponse<List<TruckPosition>> getFleet() {
        return ApiResponse.ok(trackingService.getFleet());
    }

    // Household: trucks in my ward right now + arrival time
    @GetMapping("/my-ward")
    @PreAuthorize("hasRole('HOUSEHOLD')")
    public ApiResponse<WardTrucksResponse> getMyWardTrucks(Authentication auth) {
        return ApiResponse.ok(trackingService.getMyWardTrucks(Long.valueOf(auth.getName())));
    }
}