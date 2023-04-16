package auth

import (
	"context"
	"net/http"
	"strings"

	"drailing.net/sidenote/logger"
	"github.com/go-chi/jwtauth"
	"github.com/lestrrat-go/jwx/jwk"
	"github.com/lestrrat-go/jwx/jwt"
)

type keySetHandler interface {
	Keys() jwk.Set
	Refresh() jwk.Set
}

type keySetOption struct {
	url        string
	autoKeySet *jwk.AutoRefresh
}

func (ks *keySetOption) Keys() jwk.Set {
	s, err := ks.autoKeySet.Fetch(context.Background(), ks.url)
	if err != nil {
		logger.Get().Warnw("unable to fetch keyset", "err", err.Error())
		return jwk.NewSet()
	}
	return s
}

func (ks *keySetOption) Refresh() jwk.Set {
	s, err := ks.autoKeySet.Refresh(context.Background(), ks.url)
	if err != nil {
		logger.Get().Warnw("unable to fetch keyset", "err", err.Error())
		return jwk.NewSet()
	}
	return s
}

func NewKeySetOption(url string) keySetHandler {
	ks := new(keySetOption)
	ks.url = url

	ar := jwk.NewAutoRefresh(context.Background())
	ar.Configure(url)
	ks.autoKeySet = ar

	return ks
}

func Verifier(ks keySetHandler) func(http.Handler) http.Handler {

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := r.Context()

			rawToken := tokenFromHeader(r)

			token, err := jwt.Parse([]byte(rawToken), jwt.WithKeySet(ks.Keys()))

			// if err != nil {
			// 	logger.Get().Warnw("unable to verify auth gateway key, trigger refresh")
			// 	jwt.WithKeySet(ks.Refresh())
			// 	http.Error(w, "nope", http.StatusUnauthorized)
			// 	return
			// }

			ctx = jwtauth.NewContext(ctx, token, err)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func Authenticator(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		// check for hashes in the query string
		publicAuthHash := r.URL.Query().Get(PUBLIC_QUERY_STRING)
		if publicAuthHash != "" {
			if url, found := PublicURLs.codes[publicAuthHash]; found && url.RequestURI() == r.URL.RequestURI() {
				delete(PublicURLs.codes, publicAuthHash)
				next.ServeHTTP(w, r)
				return
			}
		}

		token, _, err := jwtauth.FromContext(r.Context())

		if err != nil {
			logger.FromRequest(r).Debugw("unauthorized request, error in verify", "err", err.Error())
			http.Error(w, "unauthorized request", http.StatusUnauthorized)
			return
		}

		if token == nil {
			logger.FromRequest(r).Debugw("unauthorized request, no token found")
			http.Error(w, "unauthorized request, no token found", http.StatusUnauthorized)
			return
		}

		if err := jwt.Validate(token); err != nil {
			logger.FromRequest(r).Debugw("unauthorized request, token validation failed", "err", err.Error())
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}

		// Token is authenticated, pass it through
		next.ServeHTTP(w, r)
	})
}

func tokenFromHeader(r *http.Request) string {
	// Get token from authorization header.
	bearer := r.Header.Get("Authorization")
	if len(bearer) > 7 && strings.ToUpper(bearer[0:6]) == "BEARER" {
		return bearer[7:]
	}
	return ""
}
