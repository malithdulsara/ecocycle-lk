package lk.ecocycle.backend.schedule;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lk.ecocycle.backend.council.Council;

import java.time.Instant;
import java.time.LocalDate;

// A one-off change for every ward of a council, e.g. "No collection on Vesak Poya"
@Entity
@Table(name = "schedule_changes")
public class ScheduleChange {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "council_id", nullable = false)
    private Council council;

    @Column(name = "change_date", nullable = false)
    private LocalDate changeDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "change_type", nullable = false, length = 20)
    private ChangeType changeType;

    // Only used when changeType is RESCHEDULED
    @Column(name = "new_date")
    private LocalDate newDate;

    @Column(nullable = false)
    private String reason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }

    public Long getId() { return id; }

    public Council getCouncil() { return council; }
    public void setCouncil(Council council) { this.council = council; }

    public LocalDate getChangeDate() { return changeDate; }
    public void setChangeDate(LocalDate changeDate) { this.changeDate = changeDate; }

    public ChangeType getChangeType() { return changeType; }
    public void setChangeType(ChangeType changeType) { this.changeType = changeType; }

    public LocalDate getNewDate() { return newDate; }
    public void setNewDate(LocalDate newDate) { this.newDate = newDate; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}