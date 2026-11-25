package lk.ecocycle.backend.pickup.dto;

import lk.ecocycle.backend.pickup.PickupRequest;
import lk.ecocycle.backend.pickup.PickupStatus;
import lk.ecocycle.backend.user.User;
import lk.ecocycle.backend.wastetype.dto.WasteTypeResponse;

import java.time.Instant;
import java.time.LocalDate;

public record PickupResponse(
        Long id,
        PickupStatus status,
        WasteTypeResponse wasteType,
        String description,
        LocalDate preferredDate,
        LocalDate scheduledDate,
        String addressText,
        double latitude,
        double longitude,
        Long wardId,
        String wardName,
        String councilName,
        String photoFileName,
        String requesterName,
        String requesterPhone,
        Long driverId,
        String driverName,
        String staffNote,
        String rejectionReason,
        Instant createdAt,
        Instant completedAt
) {
    public static PickupResponse from(PickupRequest request) {
        User driver = request.getAssignedDriver();
        return new PickupResponse(
                request.getId(),
                request.getStatus(),
                WasteTypeResponse.from(request.getWasteType()),
                request.getDescription(),
                request.getPreferredDate(),
                request.getScheduledDate(),
                request.getAddressText(),
                request.getLocation().getY(),
                request.getLocation().getX(),
                request.getWard().getId(),
                request.getWard().getName(),
                request.getWard().getCouncil().getName(),
                request.getPhotoFileName(),
                request.getRequester().getFullName(),
                request.getRequester().getPhone(),
                driver == null ? null : driver.getId(),
                driver == null ? null : driver.getFullName(),
                request.getStaffNote(),
                request.getRejectionReason(),
                request.getCreatedAt(),
                request.getCompletedAt()
        );
    }
}