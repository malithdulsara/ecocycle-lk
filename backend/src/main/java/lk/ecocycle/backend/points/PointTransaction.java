package lk.ecocycle.backend.points;

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
import lk.ecocycle.backend.recycling.DropOff;
import lk.ecocycle.backend.reward.RewardRedemption;
import lk.ecocycle.backend.user.User;

import java.time.Instant;

// One line in the points ledger. Never changed or deleted after it is saved.
@Entity
@Table(name = "point_transactions")
public class PointTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, updatable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20, updatable = false)
    private TransactionType type;

    // + earned, - spent
    @Column(nullable = false, updatable = false)
    private int points;

    @Column(nullable = false, updatable = false)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "drop_off_id", updatable = false)
    private DropOff dropOff;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "redemption_id", updatable = false)
    private RewardRedemption redemption;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }

    public Long getId() { return id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public TransactionType getType() { return type; }
    public void setType(TransactionType type) { this.type = type; }

    public int getPoints() { return points; }
    public void setPoints(int points) { this.points = points; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public DropOff getDropOff() { return dropOff; }
    public void setDropOff(DropOff dropOff) { this.dropOff = dropOff; }

    public RewardRedemption getRedemption() { return redemption; }
    public void setRedemption(RewardRedemption redemption) { this.redemption = redemption; }

    public Instant getCreatedAt() { return createdAt; }
}