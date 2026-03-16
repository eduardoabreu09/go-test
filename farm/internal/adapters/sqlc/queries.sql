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