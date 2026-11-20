package lk.ecocycle.backend.council.dto;

import lk.ecocycle.backend.council.Council;

public record CouncilResponse(
        Long id,
        String name,
        String district,
        String contactEmail,
        String contactPhone
) {
    public static CouncilResponse from(Council council) {
        return new CouncilResponse(
                council.getId(),
                council.getName(),
                council.getDistrict(),
                council.getContactEmail(),
                council.getContactPhone()
        );
    }
}