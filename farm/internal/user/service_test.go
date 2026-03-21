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

func TestCreateUserShouldPass(t *testing.T) {
	service := NewService(&tests.RepoMock{})
	userDTO := repo.CreateUserParams{
		Name:  "Eduardo",
		Email: "eduardoabreu09@gmail.com",
	}
	_, err := service.CreateUser(context.Background(), userDTO)

	if err != nil {
		t.Errorf("expected to not have error %s", err)
	}
}

func TestCreateUserEmail(t *testing.T) {
	service := NewService(&tests.RepoMock{})
	userDTO := repo.CreateUserParams{
		Name:  "Eduardo",
		Email: "eduardoabreu09@gmail.com",
	}
	_, err := service.CreateUser(context.Background(), userDTO)

	if err != nil {
		t.Errorf("expected to not have error %s", err)
	}

	//Change to invalid email
	userDTO.Email = "eduardo-com"
	_, err = service.CreateUser(context.Background(), userDTO)

	if err == nil {
		t.Errorf("expected to invalid email error %s", err)
	}
	if err != ErrEmailIsInvalid {
		t.Errorf("expected to invalid email error %s", err)
	}

	// Change to empty email
	userDTO.Email = ""
	_, err = service.CreateUser(context.Background(), userDTO)

	if err == nil {
		t.Errorf("expected to empty email error %s", err)
	}
	if err != ErrEmailIsEmpty {
		t.Errorf("expected to empty email error %s", err)
	}
}

func TestCreateUserName(t *testing.T) {
	service := NewService(&tests.RepoMock{})
	userDTO := repo.CreateUserParams{
		Name:  "Eduardo",
		Email: "eduardoabreu09@gmail.com",
	}
	_, err := service.CreateUser(context.Background(), userDTO)

	if err != nil {
		t.Errorf("expected to not have error %s", err)
	}

	//Change to empty name
	userDTO.Name = ""
	_, err = service.CreateUser(context.Background(), userDTO)

	if err == nil {
		t.Errorf("expected to empty name error %s", err)
	}
	if err != ErrNameIsEmpty {
		t.Errorf("expected to empty name error %s", err)
	}
}
