package lk.ecocycle.backend.reward;

import jakarta.validation.Valid;
import lk.ecocycle.backend.common.ApiResponse;
import lk.ecocycle.backend.reward.dto.CollectVoucherRequest;
import lk.ecocycle.backend.reward.dto.RedemptionResponse;
import lk.ecocycle.backend.reward.dto.RewardRequest;
import lk.ecocycle.backend.reward.dto.RewardResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
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
@RequestMapping("/api/v1/rewards")
public class RewardController {

    private static final String MANAGERS = "hasAnyRole('ADMIN', 'RECYCLER_MANAGER')";
    private static final String HOUSEHOLD = "hasRole('HOUSEHOLD')";

    private final RewardService rewardService;

    public RewardController(RewardService rewardService) {
        this.rewardService = rewardService;
    }

    // ---------- Catalogue ----------

    // Any logged-in user: rewards that can be redeemed now
    @GetMapping
    public ApiResponse<List<RewardResponse>> getActive() {
        return ApiResponse.ok(rewardService.getActive());
    }

    // Recycler manager / admin: also hidden rewards
    @GetMapping("/all")
    @PreAuthorize(MANAGERS)
    public ApiResponse<List<RewardResponse>> getAll() {
        return ApiResponse.ok(rewardService.getAll());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize(MANAGERS)
    public ApiResponse<RewardResponse> create(@Valid @RequestBody RewardRequest request) {
        return ApiResponse.ok("Reward added", rewardService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize(MANAGERS)
    public ApiResponse<RewardResponse> update(@PathVariable Long id, @Valid @RequestBody RewardRequest request) {
        return ApiResponse.ok("Reward updated", rewardService.update(id, request));
    }

    // ---------- Redeem ----------

    @PostMapping("/{id}/redeem")
    @PreAuthorize(HOUSEHOLD)
    public ApiResponse<RedemptionResponse> redeem(Authentication auth, @PathVariable Long id) {
        return ApiResponse.ok("Reward redeemed", rewardService.redeem(Long.valueOf(auth.getName()), id));
    }

    // Household: my vouchers
    @GetMapping("/redemptions/my")
    @PreAuthorize(HOUSEHOLD)
    public ApiResponse<List<RedemptionResponse>> getMyRedemptions(Authentication auth) {
        return ApiResponse.ok(rewardService.getMyRedemptions(Long.valueOf(auth.getName())));
    }

    // Recycler manager / admin: latest vouchers
    @GetMapping("/redemptions")
    @PreAuthorize(MANAGERS)
    public ApiResponse<List<RedemptionResponse>> getAllRedemptions() {
        return ApiResponse.ok(rewardService.getAllRedemptions());
    }

    // Hand over a reward: the household shows the voucher code
    @PostMapping("/redemptions/collect")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECYCLER_MANAGER', 'CENTRE_OPERATOR')")
    public ApiResponse<RedemptionResponse> collect(@Valid @RequestBody CollectVoucherRequest request) {
        return ApiResponse.ok("Reward handed over", rewardService.collect(request.voucherCode()));
    }
}