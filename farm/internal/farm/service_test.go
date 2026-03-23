package farm

import (
	"context"
	"testing"

	"github.com/eduardoabreu09/farm/internal/tests"
)

func TestCreateFarm(t *testing.T) {
	service := NewService(&tests.RepoMock{})

	// First, happy path
	farmDTO := CreateFarmDTO{Version: "1.0.0"}
	_, err := service.CreateFarm(context.Background(), farmDTO)

	if err != nil {
		t.Errorf("expected to not have error %s", err)
	}

	// Empty version test
	farmDTO.Version = ""
	_, err = service.CreateFarm(context.Background(), farmDTO)

	if err == nil {
		t.Errorf("expected to have error")
	}
	if err != ErrVersionIsEmpty {
		t.Errorf("expected to have error version is empty, has %s", err)
	}

	farmDTO.Version = "10.0.0"
	_, err = service.CreateFarm(context.Background(), farmDTO)

	if err == nil {
		t.Errorf("expected to have error")
	}
	if err != ErrVersionNotFound {
		t.Errorf("expected to have error version not found, has %s", err)
	}
}
