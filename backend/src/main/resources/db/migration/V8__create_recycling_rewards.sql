-- Places where households bring their recyclables
CREATE TABLE collection_centres (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(100) NOT NULL UNIQUE,
    address       VARCHAR(255) NOT NULL,
    phone         VARCHAR(20),
    opening_hours VARCHAR(100), -- e.g. "Mon-Sat 8:00 AM - 5:00 PM"
    location      geometry(Point, 4326) NOT NULL,
    active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- How many points 1 kg of a material is worth. No row = the material is not accepted.
CREATE TABLE material_rates (
    id            BIGSERIAL PRIMARY KEY,
    waste_type_id BIGINT        NOT NULL UNIQUE REFERENCES waste_types (id),
    points_per_kg NUMERIC(8, 2) NOT NULL CHECK (points_per_kg > 0),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

INSERT INTO material_rates (waste_type_id, points_per_kg)
SELECT id, CASE code
               WHEN 'PLASTIC' THEN 10
               WHEN 'PAPER' THEN 5
               WHEN 'GLASS' THEN 4
               WHEN 'METAL' THEN 15
               WHEN 'E_WASTE' THEN 20
           END
FROM waste_types
WHERE code IN ('PLASTIC', 'PAPER', 'GLASS', 'METAL', 'E_WASTE');

-- "Double points for plastic in December": points are multiplied while a campaign runs
CREATE TABLE campaigns (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(100)  NOT NULL,
    description   VARCHAR(255),
    multiplier    NUMERIC(3, 1) NOT NULL CHECK (multiplier >= 1 AND multiplier <= 5),
    -- NULL = every material
    waste_type_id BIGINT REFERENCES waste_types (id),
    start_date    DATE          NOT NULL,
    end_date      DATE          NOT NULL,
    active        BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CONSTRAINT chk_campaign_dates CHECK (start_date <= end_date)
);

-- The code in a household's QR code
CREATE TABLE recycling_cards (
    user_id    BIGINT      PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    code       VARCHAR(20) NOT NULL UNIQUE, -- e.g. "ECO-7KQ2M9XA"
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One visit to a centre (the digital receipt)
CREATE TABLE drop_offs (
    id              BIGSERIAL PRIMARY KEY,
    receipt_number  VARCHAR(20)   NOT NULL UNIQUE, -- e.g. "RCP-4F7K2Q9M"
    household_id    BIGINT        NOT NULL REFERENCES users (id),
    centre_id       BIGINT        NOT NULL REFERENCES collection_centres (id),
    operator_id     BIGINT        NOT NULL REFERENCES users (id),
    total_weight_kg NUMERIC(8, 2) NOT NULL,
    total_points    INT           NOT NULL,
    -- CREDITED, PENDING_REVIEW, REJECTED
    status          VARCHAR(20)   NOT NULL,
    review_reason   VARCHAR(255), -- why it needs a review
    review_note     VARCHAR(255), -- reviewer's note
    reviewed_by     BIGINT REFERENCES users (id),
    reviewed_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_drop_offs_household ON drop_offs (household_id, created_at);
CREATE INDEX idx_drop_offs_status ON drop_offs (status);
CREATE INDEX idx_drop_offs_operator ON drop_offs (operator_id, created_at);

CREATE TABLE drop_off_items (
    id            BIGSERIAL PRIMARY KEY,
    drop_off_id   BIGINT        NOT NULL REFERENCES drop_offs (id) ON DELETE CASCADE,
    waste_type_id BIGINT        NOT NULL REFERENCES waste_types (id),
    weight_kg     NUMERIC(8, 2) NOT NULL,
    points_per_kg NUMERIC(8, 2) NOT NULL, -- the rate on that day
    multiplier    NUMERIC(3, 1) NOT NULL,
    campaign_id   BIGINT REFERENCES campaigns (id),
    points        INT           NOT NULL
);

-- Things households can buy with their points
CREATE TABLE rewards (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    points_cost INT          NOT NULL CHECK (points_cost > 0),
    stock       INT CHECK (stock >= 0), -- NULL = no limit
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE reward_redemptions (
    id           BIGSERIAL PRIMARY KEY,
    reward_id    BIGINT      NOT NULL REFERENCES rewards (id),
    user_id      BIGINT      NOT NULL REFERENCES users (id),
    points       INT         NOT NULL,
    voucher_code VARCHAR(20) NOT NULL UNIQUE, -- e.g. "VCH-8M2K4Q7P"
    -- ISSUED, COLLECTED
    status       VARCHAR(20) NOT NULL DEFAULT 'ISSUED',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    collected_at TIMESTAMPTZ
);

CREATE INDEX idx_redemptions_user ON reward_redemptions (user_id, created_at);

-- Points ledger. Every change to a balance is one row: + when earned, - when spent.
-- Balance = SUM(points). Rows are never changed or deleted.
CREATE TABLE point_transactions (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT       NOT NULL REFERENCES users (id),
    -- EARNED, REDEEMED
    type          VARCHAR(20)  NOT NULL,
    points        INT          NOT NULL,
    description   VARCHAR(255) NOT NULL,
    drop_off_id   BIGINT REFERENCES drop_offs (id),
    redemption_id BIGINT REFERENCES reward_redemptions (id),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_point_transactions_user ON point_transactions (user_id, created_at);