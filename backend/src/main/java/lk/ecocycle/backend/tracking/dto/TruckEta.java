package lk.ecocycle.backend.tracking.dto;

// A truck working in the household's ward, and roughly how long until it reaches the house
public record TruckEta(
        TruckPosition truck,
        // null until the truck has sent its first GPS point
        Double distanceKm,
        Integer etaMinutes
) {
}