package lk.ecocycle.backend.reward.dto;

import lk.ecocycle.backend.reward.RedemptionStatus;
import lk.ecocycle.backend.reward.RewardRedemption;

import java.time.Instant;

public record RedemptionResponse(
        Long id,
        Long rewardId,
        String rewardName,
        Long householdId,
        String householdName,
        int points,
        String voucherCode,
        RedemptionStatus status,
        Instant createdAt,
        Instant collectedAt
) {
    public static RedemptionResponse from(RewardRedemption redemption) {
        return new RedemptionResponse(
                redemption.getId(),
                redemption.getReward().getId(),
                redemption.getReward().getName(),
                redemption.getUser().getId(),
                redemption.getUser().getFullName(),
                redemption.getPoints(),
                redemption.getVoucherCode(),
                redemption.getStatus(),
                redemption.getCreatedAt(),
                redemption.getCollectedAt()
        );
    }
}