package farm

import (
	"log"
	"net/http"

	"github.com/eduardoabreu09/farm/internal/error"
	"github.com/eduardoabreu09/farm/internal/json"
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
