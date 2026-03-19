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

// ListFirmwares godoc
// @Summary      List all firmwares
// @Description  Returns a list of all firmware versions
// @Tags         firmwares
// @Produce      json
// @Success      200  {array}   repo.Firmware
// @Failure      500  {string}  string
// @Router       /firmwares [get]
func (h *handler) ListFirmwares(w http.ResponseWriter, r *http.Request) {
	firmwares, err := h.service.GetFirmwares(r.Context())
	if err != nil {
		error.InternalServerError(w, err)
		return
	}

	json.Write(w, http.StatusOK, firmwares)
}

// GetLastFirmware godoc
// @Summary      Get the latest firmware
// @Description  Returns the most recently created firmware
// @Tags         firmwares
// @Produce      json
// @Success      200  {object}  repo.Firmware
// @Failure      500  {string}  string
// @Router       /firmwares/last [get]
func (h *handler) GetLastFirmware(w http.ResponseWriter, r *http.Request) {
	firmware, err := h.service.GetLastFirmware(r.Context())
	if err != nil {
		error.InternalServerError(w, err)
		return
	}

	json.Write(w, http.StatusOK, firmware)
}

// GetFirmwareByVersion godoc
// @Summary      Get firmware by version
// @Description  Returns a single firmware by its version string
// @Tags         firmwares
// @Produce      json
// @Param        version  path      string  true  "Firmware version"
// @Success      200      {object}  repo.Firmware
// @Failure      500      {string}  string
// @Router       /firmwares/{version} [get]
func (h *handler) GetFirmwareByVersion(w http.ResponseWriter, r *http.Request) {
	version := chi.URLParam(r, "version")

	firmware, err := h.service.GetFirmwareByVersion(r.Context(), version)
	if err != nil {
		error.InternalServerError(w, err)
		return
	}

	json.Write(w, http.StatusOK, firmware)
}

// CreateFirmware godoc
// @Summary      Create a new firmware
// @Description  Creates a new firmware version with a download URL
// @Tags         firmwares
// @Accept       json
// @Produce      json
// @Param        firmware  body      repo.CreateFirmwareParams  true  "Firmware to create"
// @Success      201       {object}  repo.Firmware
// @Failure      400       {string}  string
// @Failure      500       {string}  string
// @Router       /firmwares [post]
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
