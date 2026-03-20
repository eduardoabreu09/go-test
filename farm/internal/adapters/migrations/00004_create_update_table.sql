-- +goose Up
-- +goose StatementBegin
CREATE TYPE download_status AS ENUM ('PENDING', 'ERROR', 'COMPLETED');
CREATE TABLE IF NOT EXISTS update_farm (
    id BIGSERIAL PRIMARY KEY,
    status download_status,
    firmware_version TEXT NOT NULL,
    farm_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_firmware FOREIGN KEY (firmware_version)
    REFERENCES firmware(version),
    CONSTRAINT fk_farm FOREIGN KEY (farm_id)
    REFERENCES farm(id)
);
-- +goose StatementEnd


-- +goose Down
-- +goose StatementBegin
DROP TYPE download_status;
DROP TABLE IF EXISTS update_farm;
-- +goose StatementEnd

