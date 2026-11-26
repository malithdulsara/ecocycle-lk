package lk.ecocycle.backend.complaint.dto;

import lk.ecocycle.backend.complaint.Complaint;
import lk.ecocycle.backend.complaint.ComplaintCategory;
import lk.ecocycle.backend.complaint.ComplaintStatus;

import java.time.Instant;

// Public status check by tracking code. No names or phone numbers here.
public record ComplaintTrackResponse(
        String trackingCode,
        ComplaintCategory category,
        ComplaintStatus status,
        String wardName,
        String councilName,
        Instant slaDueAt,
        String resolutionNote,
        Instant createdAt,
        Instant assignedAt,
        Instant startedAt,
        Instant resolvedAt
) {
    public static ComplaintTrackResponse from(Complaint complaint) {
        return new ComplaintTrackResponse(
                complaint.getTrackingCode(),
                complaint.getCategory(),
                complaint.getStatus(),
                complaint.getWard().getName(),
                complaint.getWard().getCouncil().getName(),
                complaint.getSlaDueAt(),
                complaint.getResolutionNote(),
                complaint.getCreatedAt(),
                complaint.getAssignedAt(),
                complaint.getStartedAt(),
                complaint.getResolvedAt()
        );
    }
}