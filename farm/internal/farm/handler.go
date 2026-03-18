package farm

import (
	"log"
	"net/http"
	"strconv"

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

func (h *handler) CreateFarm(w http.ResponseWriter, r *http.Request) {
	var farmDTO CreateFarmDTO
	err := json.Read(r, &farmDTO)
	if err != nil {
		error.BadRequest(w, err)
		return
	}

	farm, err := h.service.CreateFarm(r.Context(), farmDTO)
	if err != nil {
		log.Println(err)
		switch err {
		case ErrVersionIsEmpty:
			error.BadRequest(w, err)
		case ErrVersionNotFound:
			error.NotFound(w, err)
		default:
			error.InternalServerError(w, err)
		}
		return
	}

	json.Write(w, http.StatusCreated, farm)
}

func (h *handler) GetFarms(w http.ResponseWriter, r *http.Request) {
	farms, err := h.service.GetFarms(r.Context())

	if err != nil {
		error.InternalServerError(w, err)
		return
	}

	json.Write(w, http.StatusOK, farms)
}

func (h *handler) GetFarmById(w http.ResponseWriter, r *http.Request) {
	id, castError := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if castError != nil {
		error.BadRequest(w, castError)
		return
	}

	farm, err := h.service.GetFarmById(r.Context(), id)

	if err != nil {
		error.InternalServerError(w, err)
		return
	}

	json.Write(w, http.StatusOK, farm)
}

func (h *handler) DeleteFarmById(w http.ResponseWriter, r *http.Request) {
	id, castError := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if castError != nil {
		error.BadRequest(w, castError)
		return
	}

	err := h.service.DeleteFarmById(r.Context(), id)

	if err != nil {
		error.InternalServerError(w, err)
		return
	}

	json.Write(w, http.StatusNoContent, nil)
}

func (h *handler) UpdateFarmFirmware(w http.ResponseWriter, r *http.Request) {
	id, castError := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if castError != nil {
		error.BadRequest(w, castError)
		return
	}
	version := chi.URLParam(r, "version")

	farm, err := h.service.UpdateFarmFirmware(r.Context(), id, version)
	if err != nil {
		log.Println(err)
		switch err {
		case ErrVersionNotFound:
			error.NotFound(w, err)
		default:
			error.InternalServerError(w, err)
		}
		return
	}

	json.Write(w, http.StatusOK, farm)
}
