package lk.ecocycle.backend.complaint.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lk.ecocycle.backend.complaint.ComplaintCategory;

// Used by both logged-in households and guests
public record CreateComplaintRequest(
        @NotNull(message = "Choose what the problem is")
        ComplaintCategory category,

        @NotBlank(message = "Describe the problem")
        @Size(max = 1000)
        String description,

        // Where the problem is (picked on the map)
        @NotNull(message = "Pick the location on the map")
        Double latitude,

        @NotNull(message = "Pick the location on the map")
        Double longitude,

        // Optional, e.g. "Near the bus stop"
        @Size(max = 200)
        String landmark,

        // Optional: fileName returned by the photo upload
        @Size(max = 100)
        String photoFileName,

        // Guests only (optional): so the council can call back. Ignored for logged-in users.
        @Size(max = 100)
        String reporterName,

        @Pattern(regexp = "^((\\+94|0)7\\d{8})?$", message = "Phone must be a valid Sri Lankan mobile number")
        String reporterPhone
) {
}