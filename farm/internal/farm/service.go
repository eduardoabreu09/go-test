package farm

import (
	"context"
	"errors"

	repo "github.com/eduardoabreu09/farm/internal/adapters/sqlc"
)

var (
	ErrVersionIsEmpty  = errors.New("Version is required and cannot be empty")
	ErrVersionNotFound = errors.New("Version not found")
)

type Service interface {
	CreateFarm(ctx context.Context, farmDTO CreateFarmDTO) (repo.Farm, error)
	GetFarms(ctx context.Context) ([]repo.Farm, error)
	GetFarmById(ctx context.Context, id int64) (repo.Farm, error)
	DeleteFarmById(ctx context.Context, id int64) error
}

type FarmService struct {
	repo repo.Querier
}

func NewService(repo repo.Querier) Service {
	return &FarmService{
		repo: repo,
	}
}

func (f *FarmService) DeleteFarmById(ctx context.Context, id int64) error {
	return f.repo.DeleteFarmById(ctx, id)
}

func (f *FarmService) GetFarmById(ctx context.Context, id int64) (repo.Farm, error) {
	return f.repo.GetFarmById(ctx, id)
}

func (f *FarmService) GetFarms(ctx context.Context) ([]repo.Farm, error) {
	return f.repo.GetFarms(ctx)
}

func (f *FarmService) CreateFarm(ctx context.Context, farmDTO CreateFarmDTO) (repo.Farm, error) {
	if farmDTO.Version == "" {
		return repo.Farm{}, ErrVersionIsEmpty
	}
	_, err := f.repo.GetFirmwareByVersion(ctx, farmDTO.Version)
	if err != nil {
		return repo.Farm{}, ErrVersionNotFound
	}

	return f.repo.CreateFarm(ctx, farmDTO.Version)
}
