package lk.ecocycle.backend.recycling.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

// Centre operator: what a household brought in
public record DropOffRequest(
        // The code from the household's QR code, e.g. "ECO-7KQ2M9XA"
        @NotBlank(message = "Scan the household's QR code")
        String cardCode,

        @NotNull(message = "Choose your centre")
        Long centreId,

        @NotEmpty(message = "Add at least one material")
        @Size(max = 10, message = "At most 10 materials in one drop-off")
        List<@Valid @NotNull DropOffItemRequest> items
) {
}