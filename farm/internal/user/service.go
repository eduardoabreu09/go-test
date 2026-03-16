package user

import (
	"context"

	repo "github.com/eduardoabreu09/farm/internal/adapters/sqlc"
)

type Service interface {
	// TODO: return list of users, error
	GetUsers(ctx context.Context) ([]repo.User, error)
	GetUserById(ctx context.Context, id int64) (repo.User, error)
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
