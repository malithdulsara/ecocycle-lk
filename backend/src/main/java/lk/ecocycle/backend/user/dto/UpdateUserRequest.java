package lk.ecocycle.backend.user.dto;

import lk.ecocycle.backend.user.Role;

// Admin changes a user's role or turns the account on/off. Send only what you want to change.
public record UpdateUserRequest(
        Role role,
        Boolean enabled
) {
}