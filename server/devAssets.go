//go:build sndev

package server

import (
	"net/http"
	"net/http/httputil"
	"net/url"

	"github.com/go-chi/chi/v5"
)

func handleAssets(r *chi.Mux, cfg ServerConfig) {

	u, _ := url.Parse("http://localhost:3000")
	fileHandler := httputil.NewSingleHostReverseProxy(u)

	r.HandleFunc("/*", func(w http.ResponseWriter, r *http.Request) {
		fileHandler.ServeHTTP(w, r)
	})

}
