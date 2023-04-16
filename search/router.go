package search

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
)

func (s *Search) Router(r chi.Router) {

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		term := r.URL.Query().Get("q")
		res, err := s.Find(r.Context(), term)
		if err != nil {
			return
		}

		json.NewEncoder(w).Encode(res)
	})

}
