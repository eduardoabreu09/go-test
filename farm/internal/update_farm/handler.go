package updatefarm

import (
	"log"
	"net/http"
	"strconv"

	repo "github.com/eduardoabreu09/farm/internal/adapters/sqlc"
	"github.com/eduardoabreu09/farm/internal/error"
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

func (h *handler) CreateFarmUpdate(w http.ResponseWriter, r *http.Request) {
	var updateDTO repo.CreateFarmUpdateParams
	err := json.Read(r, &updateDTO)
	if err != nil {
		error.BadRequest(w, err)
		return
	}

	update, err := h.service.CreateFarmUpdate(r.Context(), updateDTO)
	if err != nil {
		log.Println(err)
		switch err {
		case ErrFarmNotFound, ErrVersionNotFound:
			error.NotFound(w, err)
		case ErrTwoUpdates:
			error.BadRequest(w, err)
		default:
			error.InternalServerError(w, err)
		}
		return
	}

	json.Write(w, http.StatusCreated, update)
}

func (h *handler) CheckPendingUpdate(w http.ResponseWriter, r *http.Request) {
	farm_id, castError := strconv.ParseInt(chi.URLParam(r, "farm_id"), 10, 64)
	if castError != nil {
		error.BadRequest(w, castError)
		return
	}

	update, err := h.service.CheckUpdate(r.Context(), farm_id)
	if err != nil {
		error.InternalServerError(w, err)
		return
	}

	json.Write(w, http.StatusOK, update)
}

func (h *handler) CompleteUpdate(w http.ResponseWriter, r *http.Request) {
	id, castError := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if castError != nil {
		error.BadRequest(w, castError)
		return
	}

	update, err := h.service.CompleteUpdate(r.Context(), id)
	if err != nil {
		error.InternalServerError(w, err)
		return
	}

	json.Write(w, http.StatusOK, update)

}
