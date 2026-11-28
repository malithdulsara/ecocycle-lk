package lk.ecocycle.backend.reward;

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
import lk.ecocycle.backend.user.User;

import java.time.Instant;

// A household spent points on a reward and got a voucher code
@Entity
@Table(name = "reward_redemptions")
public class RewardRedemption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reward_id", nullable = false)
    private Reward reward;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Points paid (the reward's price on that day)
    @Column(nullable = false)
    private int points;

    @Column(name = "voucher_code", nullable = false, unique = true, length = 20)
    private String voucherCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RedemptionStatus status = RedemptionStatus.ISSUED;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "collected_at")
    private Instant collectedAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }

    public Long getId() { return id; }

    public Reward getReward() { return reward; }
    public void setReward(Reward reward) { this.reward = reward; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public int getPoints() { return points; }
    public void setPoints(int points) { this.points = points; }

    public String getVoucherCode() { return voucherCode; }
    public void setVoucherCode(String voucherCode) { this.voucherCode = voucherCode; }

    public RedemptionStatus getStatus() { return status; }
    public void setStatus(RedemptionStatus status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }

    public Instant getCollectedAt() { return collectedAt; }
    public void setCollectedAt(Instant collectedAt) { this.collectedAt = collectedAt; }
}