package main

import (
	"log"
	"net/http"
	"time"

	repo "github.com/eduardoabreu09/farm/internal/adapters/sqlc"
	"github.com/eduardoabreu09/farm/internal/farm"
	"github.com/eduardoabreu09/farm/internal/firmware"
	updatefarm "github.com/eduardoabreu09/farm/internal/update_farm"
	"github.com/eduardoabreu09/farm/internal/user"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5"
	httpSwagger "github.com/swaggo/http-swagger/v2"

	_ "github.com/eduardoabreu09/farm/docs"
)

type application struct {
	config config
	ctx    *pgx.Conn
}

// @title          Farm API
// @version        1.0
// @description    API for managing farms, users, and firmware.
// @host           localhost:8080
// @BasePath       /
func (app *application) mount() http.Handler {
	r := chi.NewRouter()

	// A good base middleware stack
	r.Use(middleware.RequestID) // important for rate limiting
	r.Use(middleware.RealIP)    // analytics and tracing
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer) // recover from crashes
	// Set a timeout value on the request context (ctx), that will signal
	// through ctx.Done() that the request has timed out and further
	// processing should be stopped.
	r.Use(middleware.Timeout(60 * time.Second))

	repo := repo.New(app.ctx)

	// User
	userService := user.NewService(repo)
	userHandler := user.NewHandler(userService)

	// Firmware
	firmwareService := firmware.NewService(repo)
	firmwareHandler := firmware.NewHandler(firmwareService)

	// Farm
	farmService := farm.NewService(repo)
	farmHandler := farm.NewHandler(farmService)

	// Update
	updateService := updatefarm.NewService(repo, app.ctx)
	updateHandler := updatefarm.NewHandler(updateService)

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("ok"))
	})

	// User Endpoints
	r.Get("/users", userHandler.ListUsers)
	r.Get("/users/{id}", userHandler.GetUserById)
	r.Post("/users", userHandler.CreateUser)

	// Firmware Endpoints
	r.Get("/firmwares", firmwareHandler.ListFirmwares)
	r.Get("/firmwares/last", firmwareHandler.GetLastFirmware)
	r.Get("/firmwares/{version}", firmwareHandler.GetFirmwareByVersion)
	r.Post("/firmwares", firmwareHandler.CreateFirmware)

	// Farm Endpoints
	r.Get("/farms", farmHandler.GetFarms)
	r.Get("/farms/{id}", farmHandler.GetFarmById)
	r.Post("/farms", farmHandler.CreateFarm)
	r.Delete("/farms/{id}", farmHandler.DeleteFarmById)

	// Update Farm Endpoints
	r.Get("/updates/{farm_id}/check", updateHandler.CheckPendingUpdate)
	r.Post("/updates", updateHandler.CreateFarmUpdate)
	r.Put("/updates/{id}/complete", updateHandler.CompleteUpdate)

	// Swagger
	r.Get("/swagger/*", httpSwagger.WrapHandler)

	return r
}

func (app *application) run(h http.Handler) error {
	server := &http.Server{
		Addr:         app.config.addr,
		Handler:      h,
		WriteTimeout: time.Minute,
		ReadTimeout:  time.Second * 10,
		IdleTimeout:  time.Minute,
	}

	log.Printf("server has started at %s", app.config.addr)

	return server.ListenAndServe()
}

type config struct {
	addr string // URL:PORT
	db   dbConfig
}

type dbConfig struct {
	connectionString string
}
