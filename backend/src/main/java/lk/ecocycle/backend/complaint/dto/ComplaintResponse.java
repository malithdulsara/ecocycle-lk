package lk.ecocycle.backend.complaint.dto;

import lk.ecocycle.backend.complaint.Complaint;
import lk.ecocycle.backend.complaint.ComplaintCategory;
import lk.ecocycle.backend.complaint.ComplaintPriority;
import lk.ecocycle.backend.complaint.ComplaintStatus;
import lk.ecocycle.backend.user.User;

import java.time.Instant;

public record ComplaintResponse(
        Long id,
        String trackingCode,
        ComplaintCategory category,
        ComplaintPriority priority,
        ComplaintStatus status,
        String description,
        String landmark,
        double latitude,
        double longitude,
        Long wardId,
        String wardName,
        String councilName,
        String photoFileName,
        boolean anonymous,
        String reporterName,
        String reporterPhone,
        Long officerId,
        String officerName,
        Instant slaDueAt,
        boolean overdue,
        String resolutionNote,
        Instant createdAt,
        Instant assignedAt,
        Instant startedAt,
        Instant resolvedAt
) {
    public static ComplaintResponse from(Complaint complaint) {
        User reporter = complaint.getReporter();
        User officer = complaint.getAssignedOfficer();
        return new ComplaintResponse(
                complaint.getId(),
                complaint.getTrackingCode(),
                complaint.getCategory(),
                complaint.getPriority(),
                complaint.getStatus(),
                complaint.getDescription(),
                complaint.getLandmark(),
                complaint.getLocation().getY(),
                complaint.getLocation().getX(),
                complaint.getWard().getId(),
                complaint.getWard().getName(),
                complaint.getWard().getCouncil().getName(),
                complaint.getPhotoFileName(),
                reporter == null,
                reporter == null ? complaint.getReporterName() : reporter.getFullName(),
                reporter == null ? complaint.getReporterPhone() : reporter.getPhone(),
                officer == null ? null : officer.getId(),
                officer == null ? null : officer.getFullName(),
                complaint.getSlaDueAt(),
                complaint.isOverdue(),
                complaint.getResolutionNote(),
                complaint.getCreatedAt(),
                complaint.getAssignedAt(),
                complaint.getStartedAt(),
                complaint.getResolvedAt()
        );
    }
}