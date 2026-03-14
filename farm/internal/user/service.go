package user

import "context"

type Service interface {
	// TODO: return list of users, error
	GetUsers(ctx context.Context) error
}

type UserService struct {
	// TODO: add repo
}

func NewService() Service {
	return &UserService{}
}

func (s *UserService) GetUsers(ctx context.Context) error {
	return nil
}
