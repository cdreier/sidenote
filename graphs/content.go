package graphs

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
)

func (m *GraphsModule) getSingleContentGraph(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	g, err := m.store.GetContentConnections(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	json.NewEncoder(w).Encode(g)
}

func (m *GraphsModule) getContentGraph(w http.ResponseWriter, r *http.Request) {

	inclLablStr := r.URL.Query().Get("include_labels")
	var includeLabelConnections []string
	if inclLablStr != "" {
		includeLabelConnections = strings.Split(inclLablStr, ",")
	}

	g, err := m.store.GetWorldMapGraph(r.Context(), includeLabelConnections)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// img, t, err := image.Decode(bytes.NewReader(asset.Bytes))
	json.NewEncoder(w).Encode(g)

}
