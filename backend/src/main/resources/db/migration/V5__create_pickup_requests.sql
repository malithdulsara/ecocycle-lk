-- Special / bulk pickup requests from households (old furniture, garden waste, e-waste ...)
CREATE TABLE pickup_requests (
    id                 BIGSERIAL PRIMARY KEY,
    requester_id       BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    ward_id            BIGINT       NOT NULL REFERENCES wards (id),
    waste_type_id      BIGINT       NOT NULL REFERENCES waste_types (id),
    -- Copied from the household's address, so deleting the address later does not break the request
    address_text       VARCHAR(400) NOT NULL,
    location           geometry(Point, 4326) NOT NULL,
    description        VARCHAR(500) NOT NULL,
    preferred_date     DATE         NOT NULL,
    photo_file_name    VARCHAR(100),
    -- PENDING, APPROVED, ASSIGNED, COMPLETED, REJECTED, CANCELLED
    status             VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    scheduled_date     DATE,
    staff_note         VARCHAR(255),
    rejection_reason   VARCHAR(255),
    assigned_driver_id BIGINT       REFERENCES users (id),
    completed_at       TIMESTAMPTZ,
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_pickup_requests_requester ON pickup_requests (requester_id);
CREATE INDEX idx_pickup_requests_status ON pickup_requests (status);
CREATE INDEX idx_pickup_requests_driver ON pickup_requests (assigned_driver_id);