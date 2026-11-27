package lk.ecocycle.backend.truck;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lk.ecocycle.backend.council.Council;
import org.locationtech.jts.geom.Point;

import java.time.Instant;

@Entity
@Table(name = "trucks")
public class Truck {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "registration_number", nullable = false, unique = true, length = 20)
    private String registrationNumber;

    @Column(length = 100)
    private String model;

    @Column(name = "capacity_kg", nullable = false)
    private Integer capacityKg;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "council_id", nullable = false)
    private Council council;

    @Column(nullable = false)
    private boolean active = true;

    // Last GPS position sent by the driver
    @Column(name = "last_location", columnDefinition = "geometry(Point, 4326)")
    private Point lastLocation;

    @Column(name = "last_speed_kmh")
    private Double lastSpeedKmh;

    @Column(name = "last_heading")
    private Double lastHeading;

    @Column(name = "last_seen_at")
    private Instant lastSeenAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public Long getId() { return id; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public Integer getCapacityKg() { return capacityKg; }
    public void setCapacityKg(Integer capacityKg) { this.capacityKg = capacityKg; }

    public Council getCouncil() { return council; }
    public void setCouncil(Council council) { this.council = council; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public Point getLastLocation() { return lastLocation; }
    public void setLastLocation(Point lastLocation) { this.lastLocation = lastLocation; }

    public Double getLastSpeedKmh() { return lastSpeedKmh; }
    public void setLastSpeedKmh(Double lastSpeedKmh) { this.lastSpeedKmh = lastSpeedKmh; }

    public Double getLastHeading() { return lastHeading; }
    public void setLastHeading(Double lastHeading) { this.lastHeading = lastHeading; }

    public Instant getLastSeenAt() { return lastSeenAt; }
    public void setLastSeenAt(Instant lastSeenAt) { this.lastSeenAt = lastSeenAt; }
}