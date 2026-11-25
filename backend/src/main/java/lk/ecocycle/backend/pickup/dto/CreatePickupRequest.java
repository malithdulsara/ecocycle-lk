package lk.ecocycle.backend.pickup.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CreatePickupRequest(
        // One of the household's saved addresses
        @NotNull(message = "Address is required")
        Long addressId,

        @NotNull(message = "Waste type is required")
        Long wasteTypeId,

        @NotBlank(message = "Tell us what needs to be collected")
        @Size(max = 500)
        String description,

        // "2026-12-05", must be from tomorrow onwards
        @NotNull(message = "Preferred date is required")
        LocalDate preferredDate,

        // Optional: fileName returned by POST /api/v1/files
        @Size(max = 100)
        String photoFileName
) {
}