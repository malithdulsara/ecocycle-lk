package lk.ecocycle.backend.reward.dto;

import lk.ecocycle.backend.reward.Reward;

public record RewardResponse(
        Long id,
        String name,
        String description,
        int pointsCost,
        Integer stock, // null = no limit
        boolean active
) {
    public static RewardResponse from(Reward reward) {
        return new RewardResponse(
                reward.getId(),
                reward.getName(),
                reward.getDescription(),
                reward.getPointsCost(),
                reward.getStock(),
                reward.isActive()
        );
    }
}