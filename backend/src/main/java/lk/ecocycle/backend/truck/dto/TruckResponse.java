package lk.ecocycle.backend.truck.dto;

import lk.ecocycle.backend.truck.Truck;

import java.time.Instant;

public record TruckResponse(
        Long id,
        String registrationNumber,
        String model,
        Integer capacityKg,
        Long councilId,
        String councilName,
        boolean active,
        Instant lastSeenAt
) {
    public static TruckResponse from(Truck truck) {
        return new TruckResponse(
                truck.getId(),
                truck.getRegistrationNumber(),
                truck.getModel(),
                truck.getCapacityKg(),
                truck.getCouncil().getId(),
                truck.getCouncil().getName(),
                truck.isActive(),
                truck.getLastSeenAt()
        );
    }
}