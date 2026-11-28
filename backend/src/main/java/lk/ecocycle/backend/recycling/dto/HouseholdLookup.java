package lk.ecocycle.backend.recycling.dto;

// Centre operator scanned a QR code: show whose card it is
public record HouseholdLookup(
        String cardCode,
        String householdName,
        long dropOffsToday
) {
}