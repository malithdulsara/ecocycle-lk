package lk.ecocycle.backend.recycling.dto;

import java.math.BigDecimal;
import java.util.List;

// The points a drop-off would give, shown to the operator before they confirm
public record DropOffPreview(
        String householdName,
        List<DropOffItemResponse> items,
        BigDecimal totalWeightKg,
        int totalPoints,
        boolean needsReview,
        String reviewReason // why it needs a review (null = no review)
) {
}