package lk.ecocycle.backend.ward.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record WardRequest(
        @NotBlank(message = "Ward name is required")
        @Size(max = 100)
        String name,

        @NotBlank(message = "Ward code is required")
        @Size(max = 20)
        String wardCode,

        // Optional: the ward area as a list of [longitude, latitude] points
        List<List<Double>> boundary
) {
}