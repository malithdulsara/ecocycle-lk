package lk.ecocycle.backend.complaint;

public enum ComplaintStatus {
    OPEN,
    ASSIGNED,
    IN_PROGRESS,
    RESOLVED,
    REJECTED;

    // RESOLVED and REJECTED are final
    public boolean isClosed() {
        return this == RESOLVED || this == REJECTED;
    }
}