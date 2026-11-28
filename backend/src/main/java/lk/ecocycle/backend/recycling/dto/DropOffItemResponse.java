package lk.ecocycle.backend.recycling.dto;

import lk.ecocycle.backend.recycling.DropOffItem;

import java.math.BigDecimal;

public record DropOffItemResponse(
        Long wasteTypeId,
        String wasteTypeName,
        String color,
        BigDecimal weightKg,
        BigDecimal pointsPerKg,
        BigDecimal multiplier,
        String campaignName, // null = no campaign
        int points
) {
    public static DropOffItemResponse from(DropOffItem item) {
        return new DropOffItemResponse(
                item.getWasteType().getId(),
                item.getWasteType().getName(),
                item.getWasteType().getColor(),
                item.getWeightKg(),
                item.getPointsPerKg(),
                item.getMultiplier(),
                item.getCampaign() == null ? null : item.getCampaign().getName(),
                item.getPoints()
        );
    }
}