package lk.ecocycle.backend.reward;

import lk.ecocycle.backend.reward.dto.RedemptionResponse;
import lk.ecocycle.backend.reward.dto.RewardRequest;
import lk.ecocycle.backend.reward.dto.RewardResponse;

import java.util.List;

public interface RewardService {

    // ----- Catalogue -----

    // What households can choose from
    List<RewardResponse> getActive();

    // Also hidden rewards (recycler manager / admin)
    List<RewardResponse> getAll();

    RewardResponse create(RewardRequest request);

    RewardResponse update(Long rewardId, RewardRequest request);

    // ----- Redeem -----

    // Household spends points and gets a voucher code
    RedemptionResponse redeem(Long userId, Long rewardId);

    List<RedemptionResponse> getMyRedemptions(Long userId);

    // Latest 100 (recycler manager / admin)
    List<RedemptionResponse> getAllRedemptions();

    // The reward was handed over
    RedemptionResponse collect(String voucherCode);
}