package user

import (
	"context"
	"errors"
	"net/mail"

	repo "github.com/eduardoabreu09/farm/internal/adapters/sqlc"
)

var (
	ErrNameIsEmpty    = errors.New("Name is required and cannot be empty")
	ErrEmailIsEmpty   = errors.New("Email is required and cannot be empty")
	ErrEmailIsInvalid = errors.New("Email is invalid")
)

type Service interface {
	// TODO: return list of users, error
	GetUsers(ctx context.Context) ([]repo.User, error)
	GetUserById(ctx context.Context, id int64) (repo.User, error)
	CreateUser(ctx context.Context, userDTO repo.CreateUserParams) (repo.User, error)
}

type UserService struct {
	repo repo.Querier
}

func NewService(repo repo.Querier) Service {
	return &UserService{repo: repo}
}

func (s *UserService) GetUsers(ctx context.Context) ([]repo.User, error) {
	return s.repo.GetUsers(ctx)
}

func (s *UserService) GetUserById(ctx context.Context, id int64) (repo.User, error) {
	return s.repo.GetUserById(ctx, id)
}

func (s *UserService) CreateUser(ctx context.Context, userDTO repo.CreateUserParams) (repo.User, error) {
	if userDTO.Name == "" {
		return repo.User{}, ErrNameIsEmpty
	}
	if userDTO.Email == "" {
		return repo.User{}, ErrEmailIsEmpty
	}
	if _, err := mail.ParseAddress(userDTO.Email); err != nil {
		return repo.User{}, ErrEmailIsInvalid
	}

	return s.repo.CreateUser(ctx, userDTO)
}
