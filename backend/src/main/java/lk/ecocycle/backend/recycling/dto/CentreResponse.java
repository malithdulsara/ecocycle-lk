package lk.ecocycle.backend.recycling.dto;

import lk.ecocycle.backend.recycling.CollectionCentre;

public record CentreResponse(
        Long id,
        String name,
        String address,
        String phone,
        String openingHours,
        double latitude,
        double longitude,
        boolean active
) {
    public static CentreResponse from(CollectionCentre centre) {
        return new CentreResponse(
                centre.getId(),
                centre.getName(),
                centre.getAddress(),
                centre.getPhone(),
                centre.getOpeningHours(),
                centre.getLocation().getY(),
                centre.getLocation().getX(),
                centre.isActive()
        );
    }
}