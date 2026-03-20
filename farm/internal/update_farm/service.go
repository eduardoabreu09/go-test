package updatefarm

import (
	"context"
	"errors"

	repo "github.com/eduardoabreu09/farm/internal/adapters/sqlc"
	"github.com/jackc/pgx/v5"
)

var (
	ErrUpdateNotFound     = errors.New("Update not found")
	ErrUpdateIsNotPending = errors.New("Update must be pending to be completed")
	ErrFarmNotFound       = errors.New("Farm not found")
	ErrVersionNotFound    = errors.New("Version not found")
	ErrTwoUpdates         = errors.New("Cannot have two updates at the same time")
)

type Service interface {
	CreateFarmUpdate(ctx context.Context, updateDTO repo.CreateFarmUpdateParams) (repo.UpdateFarm, error)
	CheckUpdate(ctx context.Context, farm_id int64) (repo.UpdateFarm, error)
	CompleteUpdate(ctx context.Context, id int64) (repo.UpdateFarm, error)
}

type UpdateService struct {
	repo *repo.Queries
	db   *pgx.Conn
}

func NewService(repo *repo.Queries, db *pgx.Conn) Service {
	return &UpdateService{
		repo: repo,
		db:   db,
	}
}

func (u *UpdateService) CheckUpdate(ctx context.Context, farm_id int64) (repo.UpdateFarm, error) {
	return u.repo.CheckUpdate(ctx, farm_id)
}

func (u *UpdateService) CompleteUpdate(ctx context.Context, id int64) (repo.UpdateFarm, error) {
	update, err := u.repo.GetUpdateById(ctx, id)
	if err != nil {
		return repo.UpdateFarm{}, ErrUpdateNotFound
	}

	if update.Status.DownloadStatus != repo.DownloadStatusPENDING {
		return repo.UpdateFarm{}, ErrUpdateIsNotPending
	}

	tx, err := u.db.Begin(ctx)
	if err != nil {
		return repo.UpdateFarm{}, err
	}
	defer tx.Rollback(ctx)

	qtx := u.repo.WithTx(tx)

	// Change update status to completed
	update, err = qtx.CompleteUpdate(ctx, id)
	if err != nil {
		return repo.UpdateFarm{}, err
	}

	// Update farm version to new Version
	farmParams := repo.UpdateFarmVersionParams{ID: update.FarmID, FirmwareVersion: update.FirmwareVersion}
	if _, err = qtx.UpdateFarmVersion(ctx, farmParams); err != nil {
		return repo.UpdateFarm{}, err
	}

	if err = tx.Commit(ctx); err != nil {
		return repo.UpdateFarm{}, err
	}

	return update, nil
}

func (u *UpdateService) CreateFarmUpdate(ctx context.Context, updateDTO repo.CreateFarmUpdateParams) (repo.UpdateFarm, error) {
	if _, err := u.repo.GetFarmById(ctx, updateDTO.FarmID); err != nil {
		return repo.UpdateFarm{}, ErrFarmNotFound
	}
	if _, err := u.repo.GetFirmwareByVersion(ctx, updateDTO.FirmwareVersion); err != nil {
		return repo.UpdateFarm{}, ErrVersionNotFound
	}
	if _, err := u.repo.CheckUpdate(ctx, updateDTO.FarmID); err == nil {
		return repo.UpdateFarm{}, ErrTwoUpdates
	}

	return u.repo.CreateFarmUpdate(ctx, updateDTO)
}
