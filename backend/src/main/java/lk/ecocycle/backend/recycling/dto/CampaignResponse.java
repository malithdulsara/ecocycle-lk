package lk.ecocycle.backend.recycling.dto;

import lk.ecocycle.backend.recycling.Campaign;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CampaignResponse(
        Long id,
        String name,
        String description,
        BigDecimal multiplier,
        Long wasteTypeId,
        String wasteTypeName, // null = every material
        LocalDate startDate,
        LocalDate endDate,
        boolean active,
        boolean running // active and today is between the start and end date
) {
    public static CampaignResponse from(Campaign campaign, LocalDate today) {
        boolean running = campaign.isActive()
                && !today.isBefore(campaign.getStartDate())
                && !today.isAfter(campaign.getEndDate());
        return new CampaignResponse(
                campaign.getId(),
                campaign.getName(),
                campaign.getDescription(),
                campaign.getMultiplier(),
                campaign.getWasteType() == null ? null : campaign.getWasteType().getId(),
                campaign.getWasteType() == null ? null : campaign.getWasteType().getName(),
                campaign.getStartDate(),
                campaign.getEndDate(),
                campaign.isActive(),
                running
        );
    }
}