package user

import (
	"net/http"

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

func (h *handler) ListUsers(w http.ResponseWriter, r *http.Request) {
	h.service.GetUsers(r.Context())
	users := struct {
		Users []string `json:"users"`
	}{}

	users.Users = []string{"Eduardo", "João", "Ana"}

	json.Write(w, http.StatusOK, users)
}
