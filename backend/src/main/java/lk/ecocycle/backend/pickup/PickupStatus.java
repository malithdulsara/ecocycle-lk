package lk.ecocycle.backend.pickup;

// PENDING -> APPROVED -> ASSIGNED -> COMPLETED
//        \-> REJECTED (by staff)    \-> CANCELLED (by the household, before a driver is assigned)
public enum PickupStatus {
    PENDING,
    APPROVED,
    ASSIGNED,
    COMPLETED,
    REJECTED,
    CANCELLED
}