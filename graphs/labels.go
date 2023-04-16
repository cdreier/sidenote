package graphs

import (
	"encoding/json"
	"net/http"

	"drailing.net/sidenote/storage"
	"github.com/go-chi/chi/v5"
)

func (m *GraphsModule) getLabelGraph(w http.ResponseWriter, r *http.Request) {
	labelID := chi.URLParam(r, "id")

	g, err := m.store.GetLabelConnections(r.Context(), labelID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	json.NewEncoder(w).Encode(g)
}

func (m *GraphsModule) getContentsForLabel(w http.ResponseWriter, r *http.Request) {
	labelID := chi.URLParam(r, "id")

	cs, err := m.store.GetContentForLabel(r.Context(), labelID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	res := storage.ToSmallContents(cs)

	// img, t, err := image.Decode(bytes.NewReader(asset.Bytes))
	json.NewEncoder(w).Encode(struct {
		Data []storage.SmallContent `json:"data"`
	}{
		Data: res,
	})

}

func (m *GraphsModule) getContentGraphForLabel(w http.ResponseWriter, r *http.Request) {
	labelID := chi.URLParam(r, "id")

	cs, err := m.store.GetContentGraphForLabel(r.Context(), labelID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	json.NewEncoder(w).Encode(cs)
}
