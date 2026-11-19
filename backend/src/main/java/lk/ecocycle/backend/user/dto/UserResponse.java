package lk.ecocycle.backend.user.dto;

import lk.ecocycle.backend.user.User;

import java.time.Instant;

public record UserResponse(
        Long id,
        String fullName,
        String email,
        String phone,
        String role,
        String preferredLanguage,
        Instant createdAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole().name(),
                user.getPreferredLanguage(),
                user.getCreatedAt()
        );
    }
}