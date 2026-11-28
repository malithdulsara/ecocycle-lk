package lk.ecocycle.backend.points.dto;

public record PointsSummary(
        long balance,       // points that can be spent now
        long pendingPoints, // waiting for a review before they are added
        long totalEarned
) {
}