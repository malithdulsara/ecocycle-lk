-- Users of the platform (households, drivers, officers, operators, admins ...)
CREATE TABLE users (
    id                 BIGSERIAL PRIMARY KEY,
    full_name          VARCHAR(100) NOT NULL,
    email              VARCHAR(150) NOT NULL UNIQUE,
    phone              VARCHAR(20) UNIQUE,
    password_hash      VARCHAR(100) NOT NULL,
    role               VARCHAR(30)  NOT NULL,
    preferred_language VARCHAR(5)   NOT NULL DEFAULT 'en',
    enabled            BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Long-lived tokens used to get a new access token without logging in again
CREATE TABLE refresh_tokens (
    id         BIGSERIAL PRIMARY KEY,
    token      VARCHAR(100) NOT NULL UNIQUE,
    user_id    BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ  NOT NULL,
    revoked    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens (user_id);