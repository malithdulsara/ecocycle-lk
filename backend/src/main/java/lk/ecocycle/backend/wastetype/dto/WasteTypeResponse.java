package lk.ecocycle.backend.wastetype.dto;

import lk.ecocycle.backend.wastetype.WasteType;

public record WasteTypeResponse(
        Long id,
        String code,
        String name,
        String description,
        String color,
        boolean recyclable
) {
    public static WasteTypeResponse from(WasteType wasteType) {
        return new WasteTypeResponse(
                wasteType.getId(),
                wasteType.getCode(),
                wasteType.getName(),
                wasteType.getDescription(),
                wasteType.getColor(),
                wasteType.isRecyclable()
        );
    }
}