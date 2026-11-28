package lk.ecocycle.backend.recycling;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lk.ecocycle.backend.wastetype.WasteType;

import java.math.BigDecimal;

// One material in a drop-off, e.g. "Plastic, 2.5 kg, 10 points/kg x 2 = 50 points".
// The rate and multiplier are copied, so old receipts stay the same when rates change.
@Entity
@Table(name = "drop_off_items")
public class DropOffItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "drop_off_id", nullable = false)
    private DropOff dropOff;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "waste_type_id", nullable = false)
    private WasteType wasteType;

    @Column(name = "weight_kg", nullable = false, precision = 8, scale = 2)
    private BigDecimal weightKg;

    @Column(name = "points_per_kg", nullable = false, precision = 8, scale = 2)
    private BigDecimal pointsPerKg;

    @Column(nullable = false, precision = 3, scale = 1)
    private BigDecimal multiplier;

    // The campaign that gave extra points (null = none)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id")
    private Campaign campaign;

    @Column(nullable = false)
    private int points;

    public Long getId() { return id; }

    public DropOff getDropOff() { return dropOff; }
    public void setDropOff(DropOff dropOff) { this.dropOff = dropOff; }

    public WasteType getWasteType() { return wasteType; }
    public void setWasteType(WasteType wasteType) { this.wasteType = wasteType; }

    public BigDecimal getWeightKg() { return weightKg; }
    public void setWeightKg(BigDecimal weightKg) { this.weightKg = weightKg; }

    public BigDecimal getPointsPerKg() { return pointsPerKg; }
    public void setPointsPerKg(BigDecimal pointsPerKg) { this.pointsPerKg = pointsPerKg; }

    public BigDecimal getMultiplier() { return multiplier; }
    public void setMultiplier(BigDecimal multiplier) { this.multiplier = multiplier; }

    public Campaign getCampaign() { return campaign; }
    public void setCampaign(Campaign campaign) { this.campaign = campaign; }

    public int getPoints() { return points; }
    public void setPoints(int points) { this.points = points; }
}