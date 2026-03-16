package user

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

func (h *handler) ListUsers(w http.ResponseWriter, r *http.Request) {
	users, err := h.service.GetUsers(r.Context())
	if err != nil {
		error.InternalServerError(w, err)
		return
	}

	json.Write(w, http.StatusOK, users)
}

func (h *handler) GetUserById(w http.ResponseWriter, r *http.Request) {
	id, castError := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if castError != nil {
		error.BadRequest(w, castError)
		return
	}

	user, err := h.service.GetUserById(r.Context(), id)
	if err != nil {
		error.InternalServerError(w, err)
		return
	}

	json.Write(w, http.StatusOK, user)
}

func (h *handler) CreateUser(w http.ResponseWriter, r *http.Request) {
	var userDTO repo.CreateUserParams
	err := json.Read(r, &userDTO)
	if err != nil {
		error.BadRequest(w, err)
		return
	}

	user, err := h.service.CreateUser(r.Context(), userDTO)
	if err != nil {
		log.Println(err)

		switch err {
		case ErrNameIsEmpty, ErrEmailIsEmpty, ErrEmailIsInvalid:
			error.BadRequest(w, err)
		default:
			error.InternalServerError(w, err)
		}
		return
	}

	json.Write(w, http.StatusCreated, user)
}
