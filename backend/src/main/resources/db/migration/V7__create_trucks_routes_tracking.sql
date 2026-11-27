-- Council garbage trucks
CREATE TABLE trucks (
    id                  BIGSERIAL PRIMARY KEY,
    -- e.g. "WP LB-1234"
    registration_number VARCHAR(20)  NOT NULL UNIQUE,
    model               VARCHAR(100),
    capacity_kg         INTEGER      NOT NULL,
    council_id          BIGINT       NOT NULL REFERENCES councils (id),
    active              BOOLEAN      NOT NULL DEFAULT TRUE,
    -- Last GPS position sent by the driver (for the fleet map)
    last_location       geometry(Point, 4326),
    last_speed_kmh      DOUBLE PRECISION,
    last_heading        DOUBLE PRECISION,
    last_seen_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- One truck + one driver collecting in one ward on one day
CREATE TABLE collection_routes (
    id          BIGSERIAL PRIMARY KEY,
    route_date  DATE        NOT NULL,
    truck_id    BIGINT      NOT NULL REFERENCES trucks (id),
    driver_id   BIGINT      NOT NULL REFERENCES users (id),
    ward_id     BIGINT      NOT NULL REFERENCES wards (id),
    -- PLANNED, IN_PROGRESS, COMPLETED
    status      VARCHAR(20) NOT NULL DEFAULT 'PLANNED',
    started_at  TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_route_truck_ward_day UNIQUE (truck_id, ward_id, route_date)
);

CREATE INDEX idx_routes_date ON collection_routes (route_date);
CREATE INDEX idx_routes_driver ON collection_routes (driver_id);
CREATE INDEX idx_routes_status ON collection_routes (status);

-- Every GPS point sent while a route is in progress (the trail on the map)
CREATE TABLE truck_locations (
    id          BIGSERIAL PRIMARY KEY,
    truck_id    BIGINT       NOT NULL REFERENCES trucks (id) ON DELETE CASCADE,
    route_id    BIGINT       NOT NULL REFERENCES collection_routes (id) ON DELETE CASCADE,
    location    geometry(Point, 4326) NOT NULL,
    speed_kmh   DOUBLE PRECISION,
    heading     DOUBLE PRECISION,
    recorded_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_truck_locations_route ON truck_locations (route_id, recorded_at);