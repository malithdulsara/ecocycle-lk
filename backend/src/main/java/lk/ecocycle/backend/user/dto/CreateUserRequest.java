package lk.ecocycle.backend.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lk.ecocycle.backend.user.Role;

// Used by an admin to create staff accounts (drivers, council officers, ...)
public record CreateUserRequest(
        @NotBlank(message = "Full name is required")
        @Size(max = 100, message = "Full name must be at most 100 characters")
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Email is not valid")
        @Size(max = 150)
        String email,

        // Optional. Sri Lankan mobile number, e.g. 0771234567 or +94771234567
        @Pattern(regexp = "^(\\+94|0)7\\d{8}$", message = "Phone must be a valid Sri Lankan mobile number")
        String phone,

        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 72, message = "Password must be 8 to 72 characters")
        String password,

        @NotNull(message = "Role is required")
        Role role
) {
}