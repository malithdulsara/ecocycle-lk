-- Complaints from households and guests (missed pickup, illegal dumping, overflowing bin ...)
CREATE TABLE complaints (
    id                  BIGSERIAL PRIMARY KEY,
    -- Short code like "CMP-7K3Q9P" so a guest can check the status without logging in
    tracking_code       VARCHAR(12)  NOT NULL UNIQUE,
    category            VARCHAR(30)  NOT NULL,
    -- HIGH, MEDIUM, LOW (decides the SLA deadline)
    priority            VARCHAR(10)  NOT NULL,
    -- OPEN, ASSIGNED, IN_PROGRESS, RESOLVED, REJECTED
    status              VARCHAR(20)  NOT NULL DEFAULT 'OPEN',
    description         VARCHAR(1000) NOT NULL,
    landmark            VARCHAR(200),
    location            geometry(Point, 4326) NOT NULL,
    ward_id             BIGINT       NOT NULL REFERENCES wards (id),
    photo_file_name     VARCHAR(100),
    -- NULL for a guest (anonymous) complaint
    reporter_id         BIGINT       REFERENCES users (id) ON DELETE SET NULL,
    -- Optional contact details a guest can leave
    reporter_name       VARCHAR(100),
    reporter_phone      VARCHAR(20),
    assigned_officer_id BIGINT       REFERENCES users (id),
    sla_due_at          TIMESTAMPTZ  NOT NULL,
    assigned_at         TIMESTAMPTZ,
    started_at          TIMESTAMPTZ,
    resolved_at         TIMESTAMPTZ,
    -- What the officer did, or why the complaint was rejected
    resolution_note     VARCHAR(500),
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_complaints_status ON complaints (status);
CREATE INDEX idx_complaints_reporter ON complaints (reporter_id);
CREATE INDEX idx_complaints_officer ON complaints (assigned_officer_id);
CREATE INDEX idx_complaints_location ON complaints USING GIST (location);