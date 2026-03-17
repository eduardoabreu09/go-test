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
}

type FarmService struct {
	repo repo.Querier
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

func NewService(repo repo.Querier) Service {
	return &FarmService{
		repo: repo,
	}
}
