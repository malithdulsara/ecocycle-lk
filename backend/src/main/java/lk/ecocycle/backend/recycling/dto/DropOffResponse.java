package lk.ecocycle.backend.recycling.dto;

import lk.ecocycle.backend.recycling.DropOff;
import lk.ecocycle.backend.recycling.DropOffStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

// The digital receipt
public record DropOffResponse(
        Long id,
        String receiptNumber,
        Long householdId,
        String householdName,
        Long centreId,
        String centreName,
        String operatorName,
        List<DropOffItemResponse> items,
        BigDecimal totalWeightKg,
        int totalPoints,
        DropOffStatus status,
        String reviewReason,
        String reviewNote,
        String reviewedByName,
        Instant reviewedAt,
        Instant createdAt
) {
    public static DropOffResponse from(DropOff dropOff, List<DropOffItemResponse> items) {
        return new DropOffResponse(
                dropOff.getId(),
                dropOff.getReceiptNumber(),
                dropOff.getHousehold().getId(),
                dropOff.getHousehold().getFullName(),
                dropOff.getCentre().getId(),
                dropOff.getCentre().getName(),
                dropOff.getOperator().getFullName(),
                items,
                dropOff.getTotalWeightKg(),
                dropOff.getTotalPoints(),
                dropOff.getStatus(),
                dropOff.getReviewReason(),
                dropOff.getReviewNote(),
                dropOff.getReviewedBy() == null ? null : dropOff.getReviewedBy().getFullName(),
                dropOff.getReviewedAt(),
                dropOff.getCreatedAt()
        );
    }
}