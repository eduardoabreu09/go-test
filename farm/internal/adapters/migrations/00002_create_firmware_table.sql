-- +goose Up
CREATE TABLE IF NOT EXISTS firmware (
    version TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- +goose Down
DROP TABLE IF EXISTS firmware;