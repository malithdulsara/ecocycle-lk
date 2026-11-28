package lk.ecocycle.backend.recycling.dto;

import lk.ecocycle.backend.recycling.MaterialRate;
import lk.ecocycle.backend.wastetype.WasteType;

import java.math.BigDecimal;

// One recyclable material and its points. pointsPerKg = null means it is not accepted for points.
public record RateResponse(
        Long wasteTypeId,
        String wasteTypeName,
        String color,
        BigDecimal pointsPerKg
) {
    public static RateResponse of(WasteType wasteType, MaterialRate rate) {
        return new RateResponse(
                wasteType.getId(),
                wasteType.getName(),
                wasteType.getColor(),
                rate == null ? null : rate.getPointsPerKg()
        );
    }
}