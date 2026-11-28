package lk.ecocycle.backend.recycling;

import jakarta.validation.Valid;
import lk.ecocycle.backend.common.ApiResponse;
import lk.ecocycle.backend.recycling.dto.DropOffPreview;
import lk.ecocycle.backend.recycling.dto.DropOffRequest;
import lk.ecocycle.backend.recycling.dto.DropOffResponse;
import lk.ecocycle.backend.recycling.dto.HouseholdLookup;
import lk.ecocycle.backend.recycling.dto.ReviewRequest;
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
@RequestMapping("/api/v1/drop-offs")
public class DropOffController {

    private static final String OPERATOR = "hasRole('CENTRE_OPERATOR')";
    private static final String MANAGERS = "hasAnyRole('ADMIN', 'RECYCLER_MANAGER')";

    private final DropOffService dropOffService;

    public DropOffController(DropOffService dropOffService) {
        this.dropOffService = dropOffService;
    }

    // ---------- Centre operator ----------

    // ?code=ECO-7KQ2M9XA (from the QR code)
    @GetMapping("/lookup")
    @PreAuthorize(OPERATOR)
    public ApiResponse<HouseholdLookup> lookup(@RequestParam String code) {
        return ApiResponse.ok(dropOffService.lookup(code));
    }

    @PostMapping("/preview")
    @PreAuthorize(OPERATOR)
    public ApiResponse<DropOffPreview> preview(@Valid @RequestBody DropOffRequest request) {
        return ApiResponse.ok(dropOffService.preview(request));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize(OPERATOR)
    public ApiResponse<DropOffResponse> create(Authentication auth, @Valid @RequestBody DropOffRequest request) {
        return ApiResponse.ok("Drop-off saved", dropOffService.create(userId(auth), request));
    }

    @GetMapping("/recent")
    @PreAuthorize(OPERATOR)
    public ApiResponse<List<DropOffResponse>> getRecent(Authentication auth) {
        return ApiResponse.ok(dropOffService.getRecent(userId(auth)));
    }

    // ---------- Household ----------

    // My receipts
    @GetMapping("/my")
    @PreAuthorize("hasRole('HOUSEHOLD')")
    public ApiResponse<List<DropOffResponse>> getMine(Authentication auth) {
        return ApiResponse.ok(dropOffService.getMine(userId(auth)));
    }

    // ---------- Recycler manager / admin ----------

    // Unusual drop-offs waiting for a check (fraud review)
    @GetMapping("/review")
    @PreAuthorize(MANAGERS)
    public ApiResponse<List<DropOffResponse>> getPendingReview() {
        return ApiResponse.ok(dropOffService.getPendingReview());
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize(MANAGERS)
    public ApiResponse<DropOffResponse> approve(Authentication auth, @PathVariable Long id,
                                                @Valid @RequestBody ReviewRequest request) {
        return ApiResponse.ok("Points added", dropOffService.approve(userId(auth), id, request.note()));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize(MANAGERS)
    public ApiResponse<DropOffResponse> reject(Authentication auth, @PathVariable Long id,
                                               @Valid @RequestBody ReviewRequest request) {
        return ApiResponse.ok("Drop-off rejected", dropOffService.reject(userId(auth), id, request.note()));
    }

    // The token's "sub" claim is the user id
    private Long userId(Authentication auth) {
        return Long.valueOf(auth.getName());
    }
}