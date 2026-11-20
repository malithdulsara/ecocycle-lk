-- Municipal / urban / pradeshiya sabha councils
CREATE TABLE councils (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(150) NOT NULL UNIQUE,
    district      VARCHAR(50)  NOT NULL,
    contact_email VARCHAR(150),
    contact_phone VARCHAR(20),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Wards inside a council. boundary = the ward area on the map (longitude/latitude, SRID 4326)
CREATE TABLE wards (
    id         BIGSERIAL PRIMARY KEY,
    council_id BIGINT       NOT NULL REFERENCES councils (id) ON DELETE CASCADE,
    name       VARCHAR(100) NOT NULL,
    ward_code  VARCHAR(20)  NOT NULL,
    boundary   geometry(Polygon, 4326),
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT uq_wards_council_code UNIQUE (council_id, ward_code)
);

CREATE INDEX idx_wards_council_id ON wards (council_id);
CREATE INDEX idx_wards_boundary ON wards USING GIST (boundary);

-- Household addresses. location = a point on the map. ward_id is found automatically from the location.
CREATE TABLE addresses (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    ward_id      BIGINT       REFERENCES wards (id) ON DELETE SET NULL,
    label        VARCHAR(50)  NOT NULL,
    address_line VARCHAR(255) NOT NULL,
    city         VARCHAR(100) NOT NULL,
    location     geometry(Point, 4326) NOT NULL,
    is_default   BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_addresses_user_id ON addresses (user_id);
CREATE INDEX idx_addresses_location ON addresses USING GIST (location);