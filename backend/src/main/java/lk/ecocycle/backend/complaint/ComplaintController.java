package lk.ecocycle.backend.complaint;

import jakarta.validation.Valid;
import lk.ecocycle.backend.common.ApiResponse;
import lk.ecocycle.backend.complaint.dto.AssignOfficerRequest;
import lk.ecocycle.backend.complaint.dto.ComplaintNoteRequest;
import lk.ecocycle.backend.complaint.dto.ComplaintResponse;
import lk.ecocycle.backend.complaint.dto.ComplaintTrackResponse;
import lk.ecocycle.backend.complaint.dto.CreateComplaintRequest;
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
@RequestMapping("/api/v1/complaints")
public class ComplaintController {

    private static final String STAFF = "hasAnyRole('ADMIN', 'COUNCIL_OFFICER')";

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    // ---------- Public (no login) ----------

    // Guest / anonymous complaint. The answer has the tracking code to check the status later.
    @PostMapping("/guest")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ComplaintTrackResponse> createAsGuest(@Valid @RequestBody CreateComplaintRequest request) {
        return ApiResponse.ok("Complaint sent", complaintService.createAsGuest(request));
    }

    @GetMapping("/track/{code}")
    public ApiResponse<ComplaintTrackResponse> track(@PathVariable String code) {
        return ApiResponse.ok(complaintService.track(code));
    }

    // ---------- Household ----------

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('HOUSEHOLD')")
    public ApiResponse<ComplaintResponse> create(Authentication auth, @Valid @RequestBody CreateComplaintRequest request) {
        return ApiResponse.ok("Complaint sent", complaintService.create(userId(auth), request));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('HOUSEHOLD')")
    public ApiResponse<List<ComplaintResponse>> getMine(Authentication auth) {
        return ApiResponse.ok(complaintService.getMine(userId(auth)));
    }

    // ---------- Council officer / admin ----------

    // ?status=OPEN to filter, ?assignedToMe=true for "my complaints"
    @GetMapping
    @PreAuthorize(STAFF)
    public ApiResponse<List<ComplaintResponse>> getAll(Authentication auth,
                                                       @RequestParam(required = false) ComplaintStatus status,
                                                       @RequestParam(defaultValue = "false") boolean assignedToMe) {
        return ApiResponse.ok(complaintService.getAll(userId(auth), status, assignedToMe));
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize(STAFF)
    public ApiResponse<ComplaintResponse> assign(@PathVariable Long id, @Valid @RequestBody AssignOfficerRequest request) {
        return ApiResponse.ok("Complaint assigned", complaintService.assign(id, request));
    }

    @PostMapping("/{id}/start")
    @PreAuthorize(STAFF)
    public ApiResponse<ComplaintResponse> start(Authentication auth, @PathVariable Long id) {
        return ApiResponse.ok("Work started", complaintService.start(userId(auth), isAdmin(auth), id));
    }

    @PostMapping("/{id}/resolve")
    @PreAuthorize(STAFF)
    public ApiResponse<ComplaintResponse> resolve(Authentication auth, @PathVariable Long id,
                                                  @Valid @RequestBody ComplaintNoteRequest request) {
        return ApiResponse.ok("Complaint resolved", complaintService.resolve(userId(auth), isAdmin(auth), id, request));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize(STAFF)
    public ApiResponse<ComplaintResponse> reject(@PathVariable Long id, @Valid @RequestBody ComplaintNoteRequest request) {
        return ApiResponse.ok("Complaint rejected", complaintService.reject(id, request));
    }

    // ---------- Shared ----------

    @GetMapping("/{id}")
    public ApiResponse<ComplaintResponse> getById(Authentication auth, @PathVariable Long id) {
        return ApiResponse.ok(complaintService.getById(userId(auth), isStaff(auth), id));
    }

    // ---------- Helpers ----------

    // The token's "sub" claim is the user id
    private Long userId(Authentication auth) {
        return Long.valueOf(auth.getName());
    }

    private boolean isAdmin(Authentication auth) {
        return hasRole(auth, "ROLE_ADMIN");
    }

    private boolean isStaff(Authentication auth) {
        return hasRole(auth, "ROLE_ADMIN") || hasRole(auth, "ROLE_COUNCIL_OFFICER");
    }

    private boolean hasRole(Authentication auth, String role) {
        return auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals(role));
    }
}