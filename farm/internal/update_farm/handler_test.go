package updatefarm

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	repo "github.com/eduardoabreu09/farm/internal/adapters/sqlc"
)

type handlerServiceMock struct {
	listStatus repo.NullDownloadStatus
	listResult []repo.UpdateFarm
	listErr    error
}

func (m *handlerServiceMock) CreateFarmUpdate(ctx context.Context, updateDTO repo.CreateFarmUpdateParams) (repo.UpdateFarm, error) {
	panic("unexpected call to CreateFarmUpdate")
}

func (m *handlerServiceMock) CheckUpdate(ctx context.Context, farmID int64) (repo.UpdateFarm, error) {
	panic("unexpected call to CheckUpdate")
}

func (m *handlerServiceMock) CompleteUpdate(ctx context.Context, id int64) (repo.UpdateFarm, error) {
	panic("unexpected call to CompleteUpdate")
}

func (m *handlerServiceMock) ListUpdatesByStatus(ctx context.Context, status repo.NullDownloadStatus) ([]repo.UpdateFarm, error) {
	m.listStatus = status
	return m.listResult, m.listErr
}

func TestListUpdatesByStatusShouldReturnBadRequestWhenStatusIsMissing(t *testing.T) {
	handler := NewHandler(&handlerServiceMock{})
	request := httptest.NewRequest(http.MethodGet, "/updates", nil)
	response := httptest.NewRecorder()

	handler.ListUpdatesByStatus(response, request)

	if response.Code != http.StatusBadRequest {
		t.Fatalf("expected status %d, got %d", http.StatusBadRequest, response.Code)
	}
	if !strings.Contains(response.Body.String(), ErrStatusIsRequired.Error()) {
		t.Fatalf("expected body to contain %q, got %q", ErrStatusIsRequired.Error(), response.Body.String())
	}
}

func TestListUpdatesByStatusShouldReturnBadRequestWhenStatusIsInvalid(t *testing.T) {
	handler := NewHandler(&handlerServiceMock{})
	request := httptest.NewRequest(http.MethodGet, "/updates?status=INVALID", nil)
	response := httptest.NewRecorder()

	handler.ListUpdatesByStatus(response, request)

	if response.Code != http.StatusBadRequest {
		t.Fatalf("expected status %d, got %d", http.StatusBadRequest, response.Code)
	}
	if !strings.Contains(response.Body.String(), ErrStatusIsInvalid.Error()) {
		t.Fatalf("expected body to contain %q, got %q", ErrStatusIsInvalid.Error(), response.Body.String())
	}
}

func TestListUpdatesByStatusShouldReturnUpdates(t *testing.T) {
	service := &handlerServiceMock{
		listResult: []repo.UpdateFarm{
			{
				ID:              1,
				FarmID:          1,
				FirmwareVersion: "1.0.1",
				Status:          repo.NullDownloadStatus{Valid: true, DownloadStatus: repo.DownloadStatusPENDING},
			},
		},
	}

	handler := NewHandler(service)
	request := httptest.NewRequest(http.MethodGet, "/updates?status=pending", nil)
	response := httptest.NewRecorder()

	handler.ListUpdatesByStatus(response, request)

	if response.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, response.Code)
	}
	if service.listStatus.DownloadStatus != repo.DownloadStatusPENDING {
		t.Fatalf("expected status %q, got %q", repo.DownloadStatusPENDING, service.listStatus.DownloadStatus)
	}
	if !strings.Contains(response.Body.String(), "\"id\":1") {
		t.Fatalf("expected response body to contain update payload, got %q", response.Body.String())
	}
}
