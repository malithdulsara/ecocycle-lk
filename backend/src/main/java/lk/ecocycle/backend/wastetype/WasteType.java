package lk.ecocycle.backend.wastetype;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

// The list is added by the V4 migration. It is read-only for now.
@Entity
@Table(name = "waste_types")
public class WasteType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String code;

    @Column(nullable = false, length = 50)
    private String name;

    private String description;

    @Column(nullable = false, length = 7)
    private String color;

    @Column(nullable = false)
    private boolean recyclable;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    public Long getId() { return id; }
    public String getCode() { return code; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getColor() { return color; }
    public boolean isRecyclable() { return recyclable; }
    public int getSortOrder() { return sortOrder; }
}