package user

import (
	"context"
	"slices"
	"testing"

	repo "github.com/eduardoabreu09/farm/internal/adapters/sqlc"
	"github.com/eduardoabreu09/farm/internal/tests"
)

func TestGetUsers(t *testing.T) {
	service := NewService(&tests.RepoMock{})
	users, err := service.GetUsers(context.Background())
	if err != nil {
		t.Errorf("expected user list to exists")
	}
	if !slices.ContainsFunc(users, func(user repo.User) bool {
		return user.Name == "Eduardo"
	}) {
		t.Errorf("expected users to contain a user named Eduardo, got: %+v", users)
	}
}

func TestGetUserById(t *testing.T) {
	service := NewService(&tests.RepoMock{})

	_, err := service.GetUserById(context.Background(), -1)

	if err == nil {
		t.Errorf("expected error when search index out of range")
	}

	user, err := service.GetUserById(context.Background(), 1)

	if err != nil || user.Name != "Eduardo" {
		t.Fatalf("expected user named Eduardo and no error, got: %v, %s", user.Name, err)
	}
}
