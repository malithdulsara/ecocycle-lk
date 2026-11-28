package lk.ecocycle.backend.recycling;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lk.ecocycle.backend.wastetype.WasteType;

import java.math.BigDecimal;
import java.time.Instant;

// How many points 1 kg of a material is worth
@Entity
@Table(name = "material_rates")
public class MaterialRate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "waste_type_id", nullable = false, unique = true)
    private WasteType wasteType;

    @Column(name = "points_per_kg", nullable = false, precision = 8, scale = 2)
    private BigDecimal pointsPerKg;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    @PreUpdate
    void onSave() {
        updatedAt = Instant.now();
    }

    public Long getId() { return id; }

    public WasteType getWasteType() { return wasteType; }
    public void setWasteType(WasteType wasteType) { this.wasteType = wasteType; }

    public BigDecimal getPointsPerKg() { return pointsPerKg; }
    public void setPointsPerKg(BigDecimal pointsPerKg) { this.pointsPerKg = pointsPerKg; }

    public Instant getUpdatedAt() { return updatedAt; }
}