package lk.ecocycle.backend.recycling;

public enum DropOffStatus {
    CREDITED,        // points added to the balance
    PENDING_REVIEW,  // unusual drop-off: a recycler manager must check it first
    REJECTED         // reviewer said no: no points
}