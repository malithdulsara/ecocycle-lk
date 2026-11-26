package lk.ecocycle.backend.complaint;

// The SLA (service level agreement): how many hours the council has to fix the problem
public enum ComplaintPriority {
    HIGH(24),
    MEDIUM(48),
    LOW(72);

    private final int slaHours;

    ComplaintPriority(int slaHours) {
        this.slaHours = slaHours;
    }

    public int getSlaHours() {
        return slaHours;
    }
}