package lk.ecocycle.backend.complaint;

// Each kind of complaint starts with a default priority. An officer can change it later.
public enum ComplaintCategory {
    MISSED_PICKUP(ComplaintPriority.HIGH),
    OVERFLOWING_BIN(ComplaintPriority.HIGH),
    BURNING_WASTE(ComplaintPriority.HIGH),
    ILLEGAL_DUMPING(ComplaintPriority.MEDIUM),
    DAMAGED_BIN(ComplaintPriority.LOW),
    STAFF_BEHAVIOUR(ComplaintPriority.LOW),
    OTHER(ComplaintPriority.LOW);

    private final ComplaintPriority defaultPriority;

    ComplaintCategory(ComplaintPriority defaultPriority) {
        this.defaultPriority = defaultPriority;
    }

    public ComplaintPriority getDefaultPriority() {
        return defaultPriority;
    }
}