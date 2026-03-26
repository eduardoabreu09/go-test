package updatefarm

import (
	"context"
	"testing"

	repo "github.com/eduardoabreu09/farm/internal/adapters/sqlc"
	"github.com/eduardoabreu09/farm/internal/tests"
	"github.com/jackc/pgx/v5"
)

type mockTxRepo struct {
	*tests.RepoMock
}

func (r mockTxRepo) WithTx(tx pgx.Tx) txRepo {
	return r
}

func newTestService() Service {
	return newService(
		mockTxRepo{RepoMock: &tests.RepoMock{}},
		tests.BeginnerMock{Tx: &tests.TxMock{}},
	)
}

func TestCheckUpdate(t *testing.T) {
	tests.ResetRepoMockData()

	service := newService(&mockTxRepo{}, &tests.TxMock{})

	update, err := service.CheckUpdate(context.Background(), 1)
	if err != nil {
		t.Errorf("expected to not have error %s", err)
	}
	if update.ID != 1 {
		t.Errorf("expected update id 1, got %d", update.ID)
	}
	if update.Status.DownloadStatus != repo.DownloadStatusPENDING {
		t.Errorf("expected pending update, got %s", update.Status.DownloadStatus)
	}

	_, err = service.CheckUpdate(context.Background(), 2)
	if err == nil {
		t.Errorf("expected to have error")
	}
}

func TestCreateFarmUpdateShouldPass(t *testing.T) {
	tests.ResetRepoMockData()
	tests.Updates[0].Status.DownloadStatus = repo.DownloadStatusCOMPLETED

	service := newTestService()
	updateDTO := repo.CreateFarmUpdateParams{
		FarmID:          1,
		FirmwareVersion: "1.0.1",
	}

	update, err := service.CreateFarmUpdate(context.Background(), updateDTO)
	if err != nil {
		t.Errorf("expected to not have error %s", err)
	}
	if update.FarmID != updateDTO.FarmID {
		t.Errorf("expected farm id %d, got %d", updateDTO.FarmID, update.FarmID)
	}
	if update.FirmwareVersion != updateDTO.FirmwareVersion {
		t.Errorf("expected firmware version %s, got %s", updateDTO.FirmwareVersion, update.FirmwareVersion)
	}
}

func TestCreateFarmUpdateFarmNotFound(t *testing.T) {
	tests.ResetRepoMockData()

	service := newTestService()
	updateDTO := repo.CreateFarmUpdateParams{
		FarmID:          99,
		FirmwareVersion: "1.0.1",
	}

	_, err := service.CreateFarmUpdate(context.Background(), updateDTO)
	if err == nil {
		t.Errorf("expected to have error")
	}
	if err != ErrFarmNotFound {
		t.Errorf("expected farm not found error, got %s", err)
	}
}

func TestCreateFarmUpdateVersionNotFound(t *testing.T) {
	tests.ResetRepoMockData()

	service := newTestService()
	updateDTO := repo.CreateFarmUpdateParams{
		FarmID:          1,
		FirmwareVersion: "10.0.0",
	}

	_, err := service.CreateFarmUpdate(context.Background(), updateDTO)
	if err == nil {
		t.Errorf("expected to have error")
	}
	if err != ErrVersionNotFound {
		t.Errorf("expected version not found error, got %s", err)
	}
}

func TestCreateFarmUpdateShouldFailWhenHasPendingUpdate(t *testing.T) {
	tests.ResetRepoMockData()

	service := newTestService()
	updateDTO := repo.CreateFarmUpdateParams{
		FarmID:          1,
		FirmwareVersion: "1.0.1",
	}

	_, err := service.CreateFarmUpdate(context.Background(), updateDTO)
	if err == nil {
		t.Errorf("expected to have error")
	}
	if err != ErrTwoUpdates {
		t.Errorf("expected two updates error, got %s", err)
	}
}

func TestCompleteUpdateShouldPass(t *testing.T) {
	tests.ResetRepoMockData()

	service := newTestService()

	update, err := service.CompleteUpdate(context.Background(), 1)
	if err != nil {
		t.Errorf("expected to not have error %s", err)
	}
	if update.Status.DownloadStatus != repo.DownloadStatusCOMPLETED {
		t.Errorf("expected completed update, got %s", update.Status.DownloadStatus)
	}
	if tests.Farms[0].FirmwareVersion != "1.0.1" {
		t.Errorf("expected farm firmware version 1.0.1, got %s", tests.Farms[0].FirmwareVersion)
	}
}

func TestCompleteUpdateShouldFailWhenUpdateNotFound(t *testing.T) {
	tests.ResetRepoMockData()

	service := newTestService()

	_, err := service.CompleteUpdate(context.Background(), 99)
	if err == nil {
		t.Errorf("expected to have error")
	}
	if err != ErrUpdateNotFound {
		t.Errorf("expected update not found error, got %s", err)
	}
}

func TestCompleteUpdateShouldFailWhenStatusIsNotPending(t *testing.T) {
	tests.ResetRepoMockData()
	tests.Updates[0].Status.DownloadStatus = repo.DownloadStatusCOMPLETED

	service := newTestService()

	_, err := service.CompleteUpdate(context.Background(), 1)
	if err == nil {
		t.Errorf("expected to have error")
	}
	if err != ErrUpdateIsNotPending {
		t.Errorf("expected update is not pending error, got %s", err)
	}
}
