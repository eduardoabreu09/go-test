-- +goose Up
CREATE TABLE IF NOT EXISTS farm (
    id BIGSERIAL PRIMARY KEY,
    firmware_version TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_firmware FOREIGN KEY (firmware_version)
    REFERENCES firmware(version)
);


-- +goose Down
DROP TABLE IF EXISTS farm;
