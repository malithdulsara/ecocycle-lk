package lk.ecocycle.backend.complaint.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// What was done (resolve) or why it was rejected (reject)
public record ComplaintNoteRequest(
        @NotBlank(message = "Note is required")
        @Size(max = 500)
        String note
) {
}