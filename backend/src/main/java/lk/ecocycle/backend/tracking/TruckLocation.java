package lk.ecocycle.backend.tracking;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lk.ecocycle.backend.truck.CollectionRoute;
import lk.ecocycle.backend.truck.Truck;
import org.locationtech.jts.geom.Point;

import java.time.Instant;

// One GPS point sent by the driver's phone
@Entity
@Table(name = "truck_locations")
public class TruckLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "truck_id", nullable = false)
    private Truck truck;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "route_id", nullable = false)
    private CollectionRoute route;

    @Column(nullable = false, columnDefinition = "geometry(Point, 4326)")
    private Point location;

    @Column(name = "speed_kmh")
    private Double speedKmh;

    private Double heading;

    @Column(name = "recorded_at", nullable = false)
    private Instant recordedAt;

    public Long getId() { return id; }

    public Truck getTruck() { return truck; }
    public void setTruck(Truck truck) { this.truck = truck; }

    public CollectionRoute getRoute() { return route; }
    public void setRoute(CollectionRoute route) { this.route = route; }

    public Point getLocation() { return location; }
    public void setLocation(Point location) { this.location = location; }

    public Double getSpeedKmh() { return speedKmh; }
    public void setSpeedKmh(Double speedKmh) { this.speedKmh = speedKmh; }

    public Double getHeading() { return heading; }
    public void setHeading(Double heading) { this.heading = heading; }

    public Instant getRecordedAt() { return recordedAt; }
    public void setRecordedAt(Instant recordedAt) { this.recordedAt = recordedAt; }
}