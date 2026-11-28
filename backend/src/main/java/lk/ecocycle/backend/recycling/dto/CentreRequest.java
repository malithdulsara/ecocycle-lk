package lk.ecocycle.backend.recycling.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CentreRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 100)
        String name,

        @NotBlank(message = "Address is required")
        @Size(max = 255)
        String address,

        // Optional, e.g. "0112345678"
        @Pattern(regexp = "^$|^0\\d{9}$", message = "Phone must be 10 digits and start with 0")
        String phone,

        // Optional, e.g. "Mon-Sat 8:00 AM - 5:00 PM"
        @Size(max = 100)
        String openingHours,

        @NotNull(message = "Pick the location on the map")
        Double latitude,

        @NotNull(message = "Pick the location on the map")
        Double longitude,

        // Optional on create (default true). false = closed
        Boolean active
) {
}