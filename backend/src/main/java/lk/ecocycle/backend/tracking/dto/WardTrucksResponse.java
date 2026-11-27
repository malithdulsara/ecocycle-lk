package lk.ecocycle.backend.tracking.dto;

import java.util.List;

// Household: the trucks collecting in their ward right now
public record WardTrucksResponse(
        Long wardId,
        String wardName,
        double homeLatitude,
        double homeLongitude,
        List<TruckEta> trucks
) {
}