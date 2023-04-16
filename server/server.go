package server

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"html/template"
	"net/http"
	"net/url"
	"time"

	"drailing.net/sidenote/auth"
	"drailing.net/sidenote/logger"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

type Server struct {
	port    string
	config  ServerConfig
	handler http.Handler
}

type ServerConfig struct {
	Dev     bool
	NoAuth  bool
	RootURL string
	Version string
	Auth    AuthConfig
}

type AuthConfig struct {
	AuthAuthority     template.URL `json:"auth_authority,omitempty"`
	AuthClientID      string       `json:"auth_client_id,omitempty"`
	AuthRedirectUri   template.URL `json:"auth_redirect_uri,omitempty"`
	AuthPostLogoutUri template.URL `json:"auth_post_logout_uri,omitempty"`
}

type ServerModule interface {
	Router(r chi.Router)
}

func New(port string, cfg ServerConfig, apiModules map[string]ServerModule) *Server {

	if cfg.Dev {
		logger.EnableDevelopmentLogger()
	}

	s := new(Server)
	s.port = fmt.Sprintf(":%s", port)
	s.config = cfg
	s.handler = s.router(apiModules)

	return s
}

func (s *Server) router(apiModules map[string]ServerModule) http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.Recoverer)
	// r.Use(middleware.RequestLogger(NewLogEntry(r *http.Request) LogEntry))

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	}))

	if !s.config.NoAuth {
		config := auth.FetchConfigurationWithBaseURL(string(s.config.Auth.AuthAuthority))
		ks := auth.NewKeySetOption(config.JwksURI)
		r.Use(auth.Verifier(ks))
	}

	r.Route("/api", func(rr chi.Router) {
		rr.Use(middleware.SetHeader("Content-Type", "application/json"))
		if !s.config.NoAuth {
			rr.Use(auth.Authenticator)
		}
		for k, v := range apiModules {
			rr.Route(k, v.Router)
		}
		// link opener
		rr.Get("/open-link", openLink(r, s.config.RootURL))
	})
	// link opener
	// r.Get("/api/open-link", openLink(r, s.config.RootURL))

	// handling asset and config management
	handleAssets(r, s.config)

	return r
}

func openLink(router chi.Router, rootUrl string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		target := r.URL.Query().Get("url")
		u, err := url.ParseRequestURI(target)
		if err != nil {
			http.Error(w, "no url found", http.StatusBadRequest)
			return
		}
		hostCheck := "none"
		check, err := url.ParseRequestURI(rootUrl)
		if err == nil {
			hostCheck = check.Host
		}

		writer := json.NewEncoder(w)
		if hostCheck == u.Host {
			res := auth.PublicURLs.Auth(u)
			writer.Encode(res)
			return
		}
		writer.Encode(auth.PublicAuthResponse{
			URL: target,
		})

	}
}

type reactConfig struct {
	RootURL    string
	NoAuth     bool
	AuthConfig AuthConfig
	Version    string
}

func (s *Server) ListenAndServe() error {
	logger.Get().Infow("starting server", "port", s.port)
	return createHTTPServer(s.port, s.handler).ListenAndServe()
}

func createHTTPServer(addr string, hand http.Handler) *http.Server {
	return &http.Server{
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
		TLSConfig: &tls.Config{
			PreferServerCipherSuites: true,
			CurvePreferences: []tls.CurveID{
				tls.CurveP256,
				tls.X25519,
			},
		},
		Addr:    addr,
		Handler: hand,
	}
}
