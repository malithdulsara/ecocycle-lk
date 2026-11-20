package lk.ecocycle.backend.council.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CouncilRequest(
        @NotBlank(message = "Council name is required")
        @Size(max = 150)
        String name,

        @NotBlank(message = "District is required")
        @Size(max = 50)
        String district,

        @Email(message = "Contact email is not valid")
        @Size(max = 150)
        String contactEmail,

        @Size(max = 20)
        String contactPhone
) {
}