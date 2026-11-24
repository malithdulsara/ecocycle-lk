-- Kinds of waste that are collected separately
CREATE TABLE waste_types (
    id          BIGSERIAL PRIMARY KEY,
    code        VARCHAR(30)  NOT NULL UNIQUE,
    name        VARCHAR(50)  NOT NULL,
    description VARCHAR(255),
    color       VARCHAR(7)   NOT NULL, -- hex colour used in the apps, e.g. #16a34a
    recyclable  BOOLEAN      NOT NULL DEFAULT FALSE,
    sort_order  INT          NOT NULL DEFAULT 0
);

INSERT INTO waste_types (code, name, description, color, recyclable, sort_order) VALUES
    ('ORGANIC', 'Organic', 'Food waste, garden waste, leaves', '#16a34a', FALSE, 1),
    ('PLASTIC', 'Plastic', 'Bottles, bags, containers (clean and dry)', '#2563eb', TRUE, 2),
    ('PAPER', 'Paper', 'Newspapers, cardboard, books', '#ca8a04', TRUE, 3),
    ('GLASS', 'Glass', 'Bottles and jars', '#0891b2', TRUE, 4),
    ('METAL', 'Metal', 'Cans, tins, scrap metal', '#64748b', TRUE, 5),
    ('E_WASTE', 'E-waste', 'Phones, batteries, electrical items', '#9333ea', TRUE, 6),
    ('GENERAL', 'General', 'Everything that cannot be recycled', '#dc2626', FALSE, 7);

-- Weekly collection plan: which waste type is collected in which ward on which day
CREATE TABLE collection_schedules (
    id            BIGSERIAL PRIMARY KEY,
    ward_id       BIGINT       NOT NULL REFERENCES wards (id) ON DELETE CASCADE,
    waste_type_id BIGINT       NOT NULL REFERENCES waste_types (id),
    day_of_week   VARCHAR(10)  NOT NULL, -- MONDAY ... SUNDAY
    start_time    TIME         NOT NULL,
    end_time      TIME         NOT NULL,
    notes         VARCHAR(255),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT uq_schedule_ward_type_day UNIQUE (ward_id, waste_type_id, day_of_week),
    CONSTRAINT chk_schedule_times CHECK (start_time < end_time)
);

CREATE INDEX idx_collection_schedules_ward_id ON collection_schedules (ward_id);

-- One-off changes for a whole council, e.g. no collection on a poya day
CREATE TABLE schedule_changes (
    id          BIGSERIAL PRIMARY KEY,
    council_id  BIGINT       NOT NULL REFERENCES councils (id) ON DELETE CASCADE,
    change_date DATE         NOT NULL,
    change_type VARCHAR(20)  NOT NULL, -- CANCELLED or RESCHEDULED
    new_date    DATE,                  -- only for RESCHEDULED
    reason      VARCHAR(255) NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT uq_schedule_change_council_date UNIQUE (council_id, change_date)
);