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

// ListUsers godoc
// @Summary      List all users
// @Description  Returns a list of all users
// @Tags         users
// @Produce      json
// @Success      200  {array}   repo.User
// @Failure      500  {string}  string
// @Router       /users [get]
func (h *handler) ListUsers(w http.ResponseWriter, r *http.Request) {
	users, err := h.service.GetUsers(r.Context())
	if err != nil {
		error.InternalServerError(w, err)
		return
	}

	json.Write(w, http.StatusOK, users)
}

// GetUserById godoc
// @Summary      Get a user by ID
// @Description  Returns a single user by ID
// @Tags         users
// @Produce      json
// @Param        id   path      int  true  "User ID"
// @Success      200  {object}  repo.User
// @Failure      400  {string}  string
// @Failure      500  {string}  string
// @Router       /users/{id} [get]
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

// CreateUser godoc
// @Summary      Create a new user
// @Description  Creates a new user with name and email
// @Tags         users
// @Accept       json
// @Produce      json
// @Param        user  body      repo.CreateUserParams  true  "User to create"
// @Success      201   {object}  repo.User
// @Failure      400   {string}  string
// @Failure      500   {string}  string
// @Router       /users [post]
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
