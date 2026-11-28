package lk.ecocycle.backend.recycling;

import jakarta.validation.Valid;
import lk.ecocycle.backend.common.ApiResponse;
import lk.ecocycle.backend.recycling.dto.RateRequest;
import lk.ecocycle.backend.recycling.dto.RateResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rates")
public class RateController {

    private static final String MANAGERS = "hasAnyRole('ADMIN', 'RECYCLER_MANAGER')";

    private final RateService rateService;

    public RateController(RateService rateService) {
        this.rateService = rateService;
    }

    // Any logged-in user: points per kg for each recyclable material
    @GetMapping
    public ApiResponse<List<RateResponse>> getRates() {
        return ApiResponse.ok(rateService.getRates());
    }

    // Recycler manager / admin: set (or change) the rate of a material
    @PutMapping("/{wasteTypeId}")
    @PreAuthorize(MANAGERS)
    public ApiResponse<RateResponse> setRate(@PathVariable Long wasteTypeId, @Valid @RequestBody RateRequest request) {
        return ApiResponse.ok("Rate saved", rateService.setRate(wasteTypeId, request));
    }

    // Recycler manager / admin: stop giving points for a material
    @DeleteMapping("/{wasteTypeId}")
    @PreAuthorize(MANAGERS)
    public ApiResponse<Void> removeRate(@PathVariable Long wasteTypeId) {
        rateService.removeRate(wasteTypeId);
        return ApiResponse.ok("Rate removed", null);
    }
}