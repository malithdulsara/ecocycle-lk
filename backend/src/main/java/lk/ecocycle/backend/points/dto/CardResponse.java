package lk.ecocycle.backend.points.dto;

import lk.ecocycle.backend.points.RecyclingCard;

import java.time.Instant;

public record CardResponse(String code, String fullName, Instant createdAt) {

    public static CardResponse from(RecyclingCard card) {
        return new CardResponse(card.getCode(), card.getUser().getFullName(), card.getCreatedAt());
    }
}