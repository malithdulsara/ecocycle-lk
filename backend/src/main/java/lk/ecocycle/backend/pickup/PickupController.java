package lk.ecocycle.backend.pickup;

import jakarta.validation.Valid;
import lk.ecocycle.backend.common.ApiResponse;
import lk.ecocycle.backend.pickup.dto.ApprovePickupRequest;
import lk.ecocycle.backend.pickup.dto.AssignDriverRequest;
import lk.ecocycle.backend.pickup.dto.CreatePickupRequest;
import lk.ecocycle.backend.pickup.dto.PickupResponse;
import lk.ecocycle.backend.pickup.dto.RejectPickupRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/pickup-requests")
public class PickupController {

    private static final String STAFF = "hasAnyRole('ADMIN', 'COUNCIL_OFFICER')";

    private final PickupService pickupService;

    public PickupController(PickupService pickupService) {
        this.pickupService = pickupService;
    }

    // ---------- Household ----------

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('HOUSEHOLD')")
    public ApiResponse<PickupResponse> create(Authentication auth, @Valid @RequestBody CreatePickupRequest request) {
        return ApiResponse.ok("Pickup request sent", pickupService.create(userId(auth), request));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('HOUSEHOLD')")
    public ApiResponse<List<PickupResponse>> getMine(Authentication auth) {
        return ApiResponse.ok(pickupService.getMine(userId(auth)));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('HOUSEHOLD')")
    public ApiResponse<PickupResponse> cancel(Authentication auth, @PathVariable Long id) {
        return ApiResponse.ok("Pickup request cancelled", pickupService.cancel(userId(auth), id));
    }

    // ---------- Council officer / admin ----------

    // ?status=PENDING to filter, no status = all
    @GetMapping
    @PreAuthorize(STAFF)
    public ApiResponse<List<PickupResponse>> getAll(@RequestParam(required = false) PickupStatus status) {
        return ApiResponse.ok(pickupService.getAll(status));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize(STAFF)
    public ApiResponse<PickupResponse> approve(@PathVariable Long id, @Valid @RequestBody ApprovePickupRequest request) {
        return ApiResponse.ok("Pickup request approved", pickupService.approve(id, request));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize(STAFF)
    public ApiResponse<PickupResponse> reject(@PathVariable Long id, @Valid @RequestBody RejectPickupRequest request) {
        return ApiResponse.ok("Pickup request rejected", pickupService.reject(id, request));
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize(STAFF)
    public ApiResponse<PickupResponse> assign(@PathVariable Long id, @Valid @RequestBody AssignDriverRequest request) {
        return ApiResponse.ok("Driver assigned", pickupService.assignDriver(id, request));
    }

    // ---------- Driver ----------

    @GetMapping("/assigned")
    @PreAuthorize("hasRole('DRIVER')")
    public ApiResponse<List<PickupResponse>> getAssigned(Authentication auth) {
        return ApiResponse.ok(pickupService.getAssignedTo(userId(auth)));
    }

    // ---------- Shared ----------

    @GetMapping("/{id}")
    public ApiResponse<PickupResponse> getById(Authentication auth, @PathVariable Long id) {
        return ApiResponse.ok(pickupService.getById(userId(auth), isStaff(auth), id));
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('DRIVER', 'ADMIN', 'COUNCIL_OFFICER')")
    public ApiResponse<PickupResponse> complete(Authentication auth, @PathVariable Long id) {
        return ApiResponse.ok("Pickup completed", pickupService.complete(userId(auth), isStaff(auth), id));
    }

    // ---------- Helpers ----------

    // The token's "sub" claim is the user id
    private Long userId(Authentication auth) {
        return Long.valueOf(auth.getName());
    }

    private boolean isStaff(Authentication auth) {
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_COUNCIL_OFFICER"));
    }
}