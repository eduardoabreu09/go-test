package firmware

import (
	"context"
	"errors"

	repo "github.com/eduardoabreu09/farm/internal/adapters/sqlc"
)

var (
	ErrVersionIsEmpty = errors.New("Version is required and cannot be empty")
	ErrUrlIsEmpty     = errors.New("Url is required and cannot be empty")
)

type Service interface {
	GetFirmwares(ctx context.Context) ([]repo.Firmware, error)
	GetFirmwareByVersion(ctx context.Context, version string) (repo.Firmware, error)
	GetLastFirmware(ctx context.Context) (repo.Firmware, error)
	CreateFirmware(ctx context.Context, firmwareDTO repo.CreateFirmwareParams) (repo.Firmware, error)
}

type FirmwareService struct {
	repo repo.Querier
}

func NewService(repo repo.Querier) Service {
	return &FirmwareService{
		repo: repo,
	}
}

func (f *FirmwareService) CreateFirmware(ctx context.Context, firmwareDTO repo.CreateFirmwareParams) (repo.Firmware, error) {
	if firmwareDTO.Version == "" {
		return repo.Firmware{}, ErrVersionIsEmpty
	}
	if firmwareDTO.Url == "" {
		return repo.Firmware{}, ErrUrlIsEmpty
	}

	return f.repo.CreateFirmware(ctx, firmwareDTO)
}

func (f *FirmwareService) GetFirmwareByVersion(ctx context.Context, version string) (repo.Firmware, error) {
	return f.repo.GetFirmwareByVersion(ctx, version)
}

func (f *FirmwareService) GetFirmwares(ctx context.Context) ([]repo.Firmware, error) {
	return f.repo.GetFirmwares(ctx)
}

func (f *FirmwareService) GetLastFirmware(ctx context.Context) (repo.Firmware, error) {
	return f.repo.GetLastFirmware(ctx)
}
