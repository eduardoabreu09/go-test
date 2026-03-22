package firmware

import (
	"context"
	"testing"

	repo "github.com/eduardoabreu09/farm/internal/adapters/sqlc"
	"github.com/eduardoabreu09/farm/internal/tests"
)

func TestCreatFirmware(t *testing.T) {
	service := NewService(&tests.RepoMock{})
	// First, happy path
	firmwareDTO := repo.CreateFirmwareParams{
		Version: "1.0.0",
		Url:     "test.com",
	}
	_, err := service.CreateFirmware(context.Background(), firmwareDTO)

	if err != nil {
		t.Errorf("expected to not have error %s", err)
	}

	// Empty version validation
	firmwareDTO.Version = ""
	_, err = service.CreateFirmware(context.Background(), firmwareDTO)

	if err == nil {
		t.Errorf("expected to have error in version")
	}
	if err != ErrVersionIsEmpty {
		t.Errorf("expected to have error in version, has %s", err)
	}

	// Empty url validation
	firmwareDTO.Version = "1.0.0"
	firmwareDTO.Url = ""
	_, err = service.CreateFirmware(context.Background(), firmwareDTO)

	if err == nil {
		t.Errorf("expected to have error in url")
	}
	if err != ErrUrlIsEmpty {
		t.Errorf("expected to have error in url, has %s", err)
	}
}
