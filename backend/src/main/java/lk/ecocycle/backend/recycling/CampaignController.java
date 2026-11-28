package lk.ecocycle.backend.recycling;

import jakarta.validation.Valid;
import lk.ecocycle.backend.common.ApiResponse;
import lk.ecocycle.backend.recycling.dto.CampaignRequest;
import lk.ecocycle.backend.recycling.dto.CampaignResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/campaigns")
public class CampaignController {

    private static final String MANAGERS = "hasAnyRole('ADMIN', 'RECYCLER_MANAGER')";

    private final RateService rateService;

    public CampaignController(RateService rateService) {
        this.rateService = rateService;
    }

    // Recycler manager / admin: every campaign (past, running and future)
    @GetMapping
    @PreAuthorize(MANAGERS)
    public ApiResponse<List<CampaignResponse>> getAll() {
        return ApiResponse.ok(rateService.getCampaigns());
    }

    // Any logged-in user: campaigns running today
    @GetMapping("/running")
    public ApiResponse<List<CampaignResponse>> getRunning() {
        return ApiResponse.ok(rateService.getRunningCampaigns());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize(MANAGERS)
    public ApiResponse<CampaignResponse> create(@Valid @RequestBody CampaignRequest request) {
        return ApiResponse.ok("Campaign created", rateService.createCampaign(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize(MANAGERS)
    public ApiResponse<CampaignResponse> update(@PathVariable Long id, @Valid @RequestBody CampaignRequest request) {
        return ApiResponse.ok("Campaign updated", rateService.updateCampaign(id, request));
    }
}