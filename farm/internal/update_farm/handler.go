package updatefarm

import (
	"log"
	"net/http"
	"strconv"
	"strings"

	repo "github.com/eduardoabreu09/farm/internal/adapters/sqlc"
	apperror "github.com/eduardoabreu09/farm/internal/error"
	"github.com/eduardoabreu09/farm/internal/json"
	"github.com/go-chi/chi/v5"
)

type handler struct {
	service Service
}

func NewHandler(service Service) *handler {
	return &handler{
		service: service,
	}
}

func (h *handler) ListUpdatesByStatus(w http.ResponseWriter, r *http.Request) {
	status, err := parseStatus(r.URL.Query().Get("status"))
	if err != nil {
		apperror.BadRequest(w, err)
		return
	}

	updates, err := h.service.ListUpdatesByStatus(r.Context(), status)
	if err != nil {
		apperror.InternalServerError(w, err)
		return
	}

	json.Write(w, http.StatusOK, updates)
}

func (h *handler) CreateFarmUpdate(w http.ResponseWriter, r *http.Request) {
	var updateDTO repo.CreateFarmUpdateParams
	err := json.Read(r, &updateDTO)
	if err != nil {
		apperror.BadRequest(w, err)
		return
	}

	update, err := h.service.CreateFarmUpdate(r.Context(), updateDTO)
	if err != nil {
		log.Println(err)
		switch err {
		case ErrFarmNotFound, ErrVersionNotFound:
			apperror.NotFound(w, err)
		case ErrTwoUpdates:
			apperror.BadRequest(w, err)
		default:
			apperror.InternalServerError(w, err)
		}
		return
	}

	json.Write(w, http.StatusCreated, update)
}

func (h *handler) CheckPendingUpdate(w http.ResponseWriter, r *http.Request) {
	farm_id, castError := strconv.ParseInt(chi.URLParam(r, "farm_id"), 10, 64)
	if castError != nil {
		apperror.BadRequest(w, castError)
		return
	}

	update, err := h.service.CheckUpdate(r.Context(), farm_id)
	if err != nil {
		apperror.InternalServerError(w, err)
		return
	}

	json.Write(w, http.StatusOK, update)
}

func (h *handler) CompleteUpdate(w http.ResponseWriter, r *http.Request) {
	id, castError := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if castError != nil {
		apperror.BadRequest(w, castError)
		return
	}

	update, err := h.service.CompleteUpdate(r.Context(), id)
	if err != nil {
		log.Println(err)
		switch err {
		case ErrUpdateNotFound:
			apperror.NotFound(w, err)
		case ErrUpdateIsNotPending:
			apperror.BadRequest(w, err)
		default:
			apperror.InternalServerError(w, err)
		}
		return
	}

	json.Write(w, http.StatusOK, update)

}

func parseStatus(rawStatus string) (repo.NullDownloadStatus, error) {
	status := strings.ToUpper(strings.TrimSpace(rawStatus))
	if status == "" {
		return repo.NullDownloadStatus{}, ErrStatusIsRequired
	}

	switch status {
	case string(repo.DownloadStatusPENDING):
		return repo.NullDownloadStatus{Valid: true, DownloadStatus: repo.DownloadStatusPENDING}, nil
	case string(repo.DownloadStatusCOMPLETED):
		return repo.NullDownloadStatus{Valid: true, DownloadStatus: repo.DownloadStatusCOMPLETED}, nil
	case string(repo.DownloadStatusERROR):
		return repo.NullDownloadStatus{Valid: true, DownloadStatus: repo.DownloadStatusERROR}, nil
	default:
		return repo.NullDownloadStatus{}, ErrStatusIsInvalid
	}
}
