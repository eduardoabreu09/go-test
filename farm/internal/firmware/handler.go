package firmware

import (
	"log"
	"net/http"

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

func (h *handler) ListFirmwares(w http.ResponseWriter, r *http.Request) {
	firmwares, err := h.service.GetFirmwares(r.Context())
	if err != nil {
		error.InternalServerError(w, err)
		return
	}

	json.Write(w, http.StatusOK, firmwares)
}

func (h *handler) GetLastFirmware(w http.ResponseWriter, r *http.Request) {
	firmware, err := h.service.GetLastFirmware(r.Context())
	if err != nil {
		error.InternalServerError(w, err)
		return
	}

	json.Write(w, http.StatusOK, firmware)
}

func (h *handler) GetFirmwareByVersion(w http.ResponseWriter, r *http.Request) {
	version := chi.URLParam(r, "version")

	firmware, err := h.service.GetFirmwareByVersion(r.Context(), version)
	if err != nil {
		error.InternalServerError(w, err)
		return
	}

	json.Write(w, http.StatusOK, firmware)
}

func (h *handler) CreateFirmware(w http.ResponseWriter, r *http.Request) {
	var firmwareDTO repo.CreateFirmwareParams
	err := json.Read(r, &firmwareDTO)
	if err != nil {
		error.BadRequest(w, err)
		return
	}

	firmware, err := h.service.CreateFirmware(r.Context(), firmwareDTO)
	if err != nil {
		log.Println(err)

		switch err {
		case ErrVersionIsEmpty, ErrUrlIsEmpty:
			error.BadRequest(w, err)
		default:
			error.InternalServerError(w, err)
		}
		return
	}

	json.Write(w, http.StatusCreated, firmware)
}
