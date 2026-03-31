package main

import (
	"context"
	"log/slog"
	"os"

	"github.com/eduardoabreu09/farm/internal/env"
	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	ctx := context.Background()

	cfg := config{
		addr: ":8080",
		db: dbConfig{
			connectionString: env.GetString("GOOSE_DBSTRING", "host=localhost user=postgres password=admin dbname=farm sslmode=disable"),
		},
	}

	// logger
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	// Database
	pool, err := pgxpool.New(ctx, cfg.db.connectionString)
	if err != nil {
		panic(err)
	}
	defer pool.Close()

	logger.Info("connect to database", "connectionString", cfg.db.connectionString)

	api := application{
		config: cfg,
		db:     pool,
	}

	if err := api.run(api.mount()); err != nil {
		slog.Error("server has failed", "error", err)
		os.Exit(1)
	}
}
