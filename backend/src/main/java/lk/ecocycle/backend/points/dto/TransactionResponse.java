package lk.ecocycle.backend.points.dto;

import lk.ecocycle.backend.points.PointTransaction;
import lk.ecocycle.backend.points.TransactionType;

import java.time.Instant;

public record TransactionResponse(
        Long id,
        TransactionType type,
        int points,
        String description,
        Long dropOffId,      // open the receipt
        String voucherCode,  // for a redeemed reward
        Instant createdAt
) {
    public static TransactionResponse from(PointTransaction transaction) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getType(),
                transaction.getPoints(),
                transaction.getDescription(),
                transaction.getDropOff() == null ? null : transaction.getDropOff().getId(),
                transaction.getRedemption() == null ? null : transaction.getRedemption().getVoucherCode(),
                transaction.getCreatedAt()
        );
    }
}