package server

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/assert"
)

func Test_openLink(t *testing.T) {

	type args struct {
		url string
	}
	type expect struct {
		code int
	}
	tests := []struct {
		name   string
		args   args
		expect expect
	}{
		{
			name: "invalid url",
			args: args{
				url: "asdf",
			},
			expect: expect{
				code: http.StatusBadRequest,
			},
		},
		{
			name: "external url",
			args: args{
				url: "https://drailing.net",
			},
			expect: expect{
				code: http.StatusOK,
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {

			router := chi.NewRouter()
			router.Get("/plplpl", func(w http.ResponseWriter, r *http.Request) {
				w.WriteHeader(http.StatusOK)
				w.Write([]byte("plplpl"))
			})

			r := httptest.NewRequest("GET", fmt.Sprintf("/?url=%s", tt.args.url), nil)
			rr := httptest.NewRecorder()
			openLink(router, "")(rr, r)

			assert.Equal(t, tt.expect.code, rr.Code, "status code does not match for %s:  %d <> %d", tt.args.url, tt.expect.code, rr.Code)
		})
	}
}
