-- name: GetUsers :many
SELECT * FROM users;

-- name: GetUserById :one
SELECT * FROM users WHERE Id = $1 LIMIT 1;

-- name: CreateUser :one
INSERT INTO users (
  name, email
) VALUES (
  $1, $2
)
RETURNING *;

-- name: GetFirmwares :many
SELECT * FROM firmware;

-- name: GetFirmwareByVersion :one
SELECT * FROM firmware WHERE version = $1 LIMIT 1;

-- name: GetLastFirmware :one
SELECT * FROM firmware ORDER BY created_at DESC  LIMIT 1;

-- name: CreateFirmware :one
INSERT INTO firmware (
  version, url
) VALUES (
  $1, $2
)
RETURNING *;

-- name: CreateFarm :one
INSERT INTO farm (
  firmware_version
) VALUES (
  $1
)
RETURNING *;

-- name: GetFarms :many
SELECT * FROM farm;

-- name: GetFarmById :one
SELECT * FROM farm WHERE id = $1 LIMIT 1;

-- name: DeleteFarmById :exec
DELETE FROM farm WHERE id = $1;

-- name: UpdateFarmVersion :one
UPDATE farm
  set firmware_version = $2,
  updated_at = now()
WHERE id = $1
RETURNING *;

-- name: CreateFarmUpdate :one
INSERT INTO update_farm (
  farm_id, firmware_version 
) VALUES (
  $1, $2
)
RETURNING *;

-- name: CheckUpdate :one
SELECT * FROM update_farm
WHERE farm_id = $1
AND status = 'PENDING'
LIMIT 1;

-- name: CompleteUpdate :one
UPDATE update_farm
  set status = 'COMPLETED',
  updated_at = now()
WHERE id = $1
RETURNING *;