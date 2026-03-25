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
	Users     = []repo.User{{ID: 1, Name: "Eduardo", Email: "eduardoabreu09@gmail.com"}}
	Firmwares = []repo.Firmware{{Version: "1.0.0", Url: "test.com"}, {Version: "1.0.1", Url: "test.com"}}
	Farms     = []repo.Farm{{ID: 1, FirmwareVersion: "1.0.0"}}
	Updates   = []repo.UpdateFarm{{ID: 1, FarmID: 1, FirmwareVersion: "1.0.1", Status: repo.NullDownloadStatus{Valid: true, DownloadStatus: repo.DownloadStatusPENDING}}}
)

func (r *RepoMock) CheckUpdate(ctx context.Context, farmID int64) (repo.UpdateFarm, error) {
	for _, update := range Updates {
		if update.FarmID == farmID && update.Status.DownloadStatus == repo.DownloadStatusPENDING {
			return update, nil
		}
	}
	return repo.UpdateFarm{}, errors.New("update not found")
}

func (r *RepoMock) CompleteUpdate(ctx context.Context, id int64) (repo.UpdateFarm, error) {
	for i, update := range Updates {
		if update.ID == id {
			Updates[i].Status.DownloadStatus = repo.DownloadStatusCOMPLETED
			Updates[i].UpdatedAt = pgtype.Timestamptz{Time: time.Now()}
			return Updates[i], nil
		}
	}
	return repo.UpdateFarm{}, errors.New("update not found")
}

func (r *RepoMock) CreateFarm(ctx context.Context, firmwareVersion string) (repo.Farm, error) {
	if _, err := r.GetFirmwareByVersion(ctx, firmwareVersion); err != nil {
		return repo.Farm{}, err
	}

	farm := repo.Farm{
		ID:              2,
		FirmwareVersion: firmwareVersion,
		CreatedAt:       pgtype.Timestamptz{Time: time.Now()},
		UpdatedAt:       pgtype.Timestamptz{Time: time.Now()},
	}
	Farms = append(Farms, farm)
	return farm, nil
}

func (r *RepoMock) CreateFarmUpdate(ctx context.Context, arg repo.CreateFarmUpdateParams) (repo.UpdateFarm, error) {
	if _, err := r.GetFarmById(ctx, arg.FarmID); err != nil {
		return repo.UpdateFarm{}, err
	}
	if _, err := r.GetFirmwareByVersion(ctx, arg.FirmwareVersion); err != nil {
		return repo.UpdateFarm{}, err
	}

	update := repo.UpdateFarm{
		ID:              2,
		Status:          repo.NullDownloadStatus{DownloadStatus: repo.DownloadStatusPENDING, Valid: true},
		FirmwareVersion: arg.FirmwareVersion,
		FarmID:          arg.FarmID,
		CreatedAt:       pgtype.Timestamptz{Time: time.Now()},
		UpdatedAt:       pgtype.Timestamptz{Time: time.Now()},
	}
	Updates = append(Updates, update)
	return update, nil
}

func (r *RepoMock) CreateFirmware(ctx context.Context, arg repo.CreateFirmwareParams) (repo.Firmware, error) {
	firmware := repo.Firmware{
		Version:   arg.Version,
		Url:       arg.Url,
		CreatedAt: pgtype.Timestamptz{Time: time.Now()},
	}
	Firmwares = append(Firmwares, firmware)
	return firmware, nil
}

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

func (r *RepoMock) GetFarmById(ctx context.Context, id int64) (repo.Farm, error) {
	for _, farm := range Farms {
		if farm.ID == id {
			return farm, nil
		}
	}
	return repo.Farm{}, errors.New("farm not found")
}

func (r *RepoMock) GetFarms(ctx context.Context) ([]repo.Farm, error) {
	return Farms, nil
}

func (r *RepoMock) GetFirmwareByVersion(ctx context.Context, version string) (repo.Firmware, error) {
	for _, firmware := range Firmwares {
		if firmware.Version == version {
			return firmware, nil
		}
	}
	return repo.Firmware{}, errors.New("firmware not found")
}

func (r *RepoMock) GetFirmwares(ctx context.Context) ([]repo.Firmware, error) {
	return Firmwares, nil
}

func (r *RepoMock) GetLastFirmware(ctx context.Context) (repo.Firmware, error) {
	res := Firmwares[0]
	for _, firmware := range Firmwares {
		if firmware.Version > res.Version {
			res = firmware
		}
	}
	return res, nil
}

func (r *RepoMock) GetUpdateById(ctx context.Context, id int64) (repo.UpdateFarm, error) {
	for _, update := range Updates {
		if update.ID == id {
			return update, nil
		}
	}
	return repo.UpdateFarm{}, errors.New("update not found")
}

func (r *RepoMock) UpdateFarmVersion(ctx context.Context, arg repo.UpdateFarmVersionParams) (repo.Farm, error) {
	for i, farm := range Farms {
		if farm.ID == arg.ID {
			Farms[i].FirmwareVersion = arg.FirmwareVersion
			Farms[i].UpdatedAt = pgtype.Timestamptz{Time: time.Now()}
			return Farms[i], nil
		}
	}
	return repo.Farm{}, errors.New("farm not found")
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
