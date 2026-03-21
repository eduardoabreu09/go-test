package tests

import (
	"context"
	"errors"
	"time"

	repo "github.com/eduardoabreu09/farm/internal/adapters/sqlc"
	"github.com/jackc/pgx/v5/pgtype"
)

type RepoMock struct {
}

var (
	Users = []repo.User{{ID: 1, Name: "Eduardo", Email: "eduardoabreu09@gmail.com"}}
)

// CheckUpdate implements [repo.Querier].
func (r *RepoMock) CheckUpdate(ctx context.Context, farmID int64) (repo.UpdateFarm, error) {
	panic("unimplemented")
}

// CompleteUpdate implements [repo.Querier].
func (r *RepoMock) CompleteUpdate(ctx context.Context, id int64) (repo.UpdateFarm, error) {
	panic("unimplemented")
}

// CreateFarm implements [repo.Querier].
func (r *RepoMock) CreateFarm(ctx context.Context, firmwareVersion string) (repo.Farm, error) {
	panic("unimplemented")
}

// CreateFarmUpdate implements [repo.Querier].
func (r *RepoMock) CreateFarmUpdate(ctx context.Context, arg repo.CreateFarmUpdateParams) (repo.UpdateFarm, error) {
	panic("unimplemented")
}

// CreateFirmware implements [repo.Querier].
func (r *RepoMock) CreateFirmware(ctx context.Context, arg repo.CreateFirmwareParams) (repo.Firmware, error) {
	panic("unimplemented")
}

// CreateUser implements [repo.Querier].
func (r *RepoMock) CreateUser(ctx context.Context, arg repo.CreateUserParams) (repo.User, error) {
	user := repo.User{
		ID:        2,
		Name:      arg.Name,
		Email:     arg.Email,
		CreatedAt: pgtype.Timestamptz{Time: time.Now()},
	}
	Users = append(Users, user)
	return user, nil
}

// DeleteFarmById implements [repo.Querier].
func (r *RepoMock) DeleteFarmById(ctx context.Context, id int64) error {
	panic("unimplemented")
}

// GetFarmById implements [repo.Querier].
func (r *RepoMock) GetFarmById(ctx context.Context, id int64) (repo.Farm, error) {
	panic("unimplemented")
}

// GetFarms implements [repo.Querier].
func (r *RepoMock) GetFarms(ctx context.Context) ([]repo.Farm, error) {
	panic("unimplemented")
}

// GetFirmwareByVersion implements [repo.Querier].
func (r *RepoMock) GetFirmwareByVersion(ctx context.Context, version string) (repo.Firmware, error) {
	panic("unimplemented")
}

// GetFirmwares implements [repo.Querier].
func (r *RepoMock) GetFirmwares(ctx context.Context) ([]repo.Firmware, error) {
	panic("unimplemented")
}

// GetLastFirmware implements [repo.Querier].
func (r *RepoMock) GetLastFirmware(ctx context.Context) (repo.Firmware, error) {
	panic("unimplemented")
}

// GetUpdateById implements [repo.Querier].
func (r *RepoMock) GetUpdateById(ctx context.Context, id int64) (repo.UpdateFarm, error) {
	panic("unimplemented")
}

// UpdateFarmVersion implements [repo.Querier].
func (r *RepoMock) UpdateFarmVersion(ctx context.Context, arg repo.UpdateFarmVersionParams) (repo.Farm, error) {
	panic("unimplemented")
}

func (r *RepoMock) GetUsers(ctx context.Context) ([]repo.User, error) {
	return Users, nil
}

func (r *RepoMock) GetUserById(ctx context.Context, id int64) (repo.User, error) {
	for _, user := range Users {
		if user.ID == id {
			return user, nil
		}
	}
	return repo.User{}, errors.New("user not found")
}
