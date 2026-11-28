package lk.ecocycle.backend.recycling;

import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lk.ecocycle.backend.user.User;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

// One visit to a collection centre. Also the household's digital receipt.
@Entity
@Table(name = "drop_offs")
public class DropOff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "receipt_number", nullable = false, unique = true, length = 20)
    private String receiptNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "household_id", nullable = false)
    private User household;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "centre_id", nullable = false)
    private CollectionCentre centre;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "operator_id", nullable = false)
    private User operator;

    @OneToMany(mappedBy = "dropOff", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id")
    private List<DropOffItem> items = new ArrayList<>();

    @Column(name = "total_weight_kg", nullable = false, precision = 8, scale = 2)
    private BigDecimal totalWeightKg;

    @Column(name = "total_points", nullable = false)
    private int totalPoints;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DropOffStatus status;

    @Column(name = "review_reason")
    private String reviewReason;

    @Column(name = "review_note")
    private String reviewNote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }

    public void addItem(DropOffItem item) {
        item.setDropOff(this);
        items.add(item);
    }

    public Long getId() { return id; }

    public String getReceiptNumber() { return receiptNumber; }
    public void setReceiptNumber(String receiptNumber) { this.receiptNumber = receiptNumber; }

    public User getHousehold() { return household; }
    public void setHousehold(User household) { this.household = household; }

    public CollectionCentre getCentre() { return centre; }
    public void setCentre(CollectionCentre centre) { this.centre = centre; }

    public User getOperator() { return operator; }
    public void setOperator(User operator) { this.operator = operator; }

    public List<DropOffItem> getItems() { return items; }

    public BigDecimal getTotalWeightKg() { return totalWeightKg; }
    public void setTotalWeightKg(BigDecimal totalWeightKg) { this.totalWeightKg = totalWeightKg; }

    public int getTotalPoints() { return totalPoints; }
    public void setTotalPoints(int totalPoints) { this.totalPoints = totalPoints; }

    public DropOffStatus getStatus() { return status; }
    public void setStatus(DropOffStatus status) { this.status = status; }

    public String getReviewReason() { return reviewReason; }
    public void setReviewReason(String reviewReason) { this.reviewReason = reviewReason; }

    public String getReviewNote() { return reviewNote; }
    public void setReviewNote(String reviewNote) { this.reviewNote = reviewNote; }

    public User getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(User reviewedBy) { this.reviewedBy = reviewedBy; }

    public Instant getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(Instant reviewedAt) { this.reviewedAt = reviewedAt; }

    public Instant getCreatedAt() { return createdAt; }
}