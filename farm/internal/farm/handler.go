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

// CreateFarm godoc
// @Summary      Create a new farm
// @Description  Creates a new farm with a firmware version
// @Tags         farm
// @Accept       json
// @Produce      json
// @Param        farm  body      CreateFarmDTO  true  "Farm to create"
// @Success      201   {object}  repo.Farm
// @Failure      400   {string}  string
// @Failure      404   {string}  string
// @Failure      500   {string}  string
// @Router       /farm [post]
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

// GetFarms godoc
// @Summary      List all farms
// @Description  Returns a list of all farms
// @Tags         farm
// @Produce      json
// @Success      200  {array}   repo.Farm
// @Failure      500  {string}  string
// @Router       /farm [get]
func (h *handler) GetFarms(w http.ResponseWriter, r *http.Request) {
	farms, err := h.service.GetFarms(r.Context())

	if err != nil {
		error.InternalServerError(w, err)
		return
	}

	json.Write(w, http.StatusOK, farms)
}

// GetFarmById godoc
// @Summary      Get a farm by ID
// @Description  Returns a single farm by ID
// @Tags         farm
// @Produce      json
// @Param        id   path      int  true  "Farm ID"
// @Success      200  {object}  repo.Farm
// @Failure      400  {string}  string
// @Failure      500  {string}  string
// @Router       /farm/{id} [get]
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

// DeleteFarmById godoc
// @Summary      Delete a farm by ID
// @Description  Deletes a farm by its ID
// @Tags         farm
// @Param        id   path      int  true  "Farm ID"
// @Success      204
// @Failure      400  {string}  string
// @Failure      500  {string}  string
// @Router       /farm/{id} [delete]
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
