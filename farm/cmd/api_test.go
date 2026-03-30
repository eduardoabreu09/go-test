package main

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestMount_AllowsLocalFrontendOrigins(t *testing.T) {
	app := application{}
	handler := app.mount()

	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	req.Header.Set("Origin", "http://localhost:4200")

	res := httptest.NewRecorder()
	handler.ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, res.Code)
	}

	if got := res.Header().Get("Access-Control-Allow-Origin"); got != "http://localhost:4200" {
		t.Fatalf("expected Access-Control-Allow-Origin to be %q, got %q", "http://localhost:4200", got)
	}
}