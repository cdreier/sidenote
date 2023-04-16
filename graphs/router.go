package graphs

import "github.com/go-chi/chi/v5"

func (m *GraphsModule) Router(r chi.Router) {

	r.Get("/contents/map", m.getContentGraph)
	r.Get("/contents/map/{id}", m.getSingleContentGraph)
	r.Get("/labels/{id}", m.getLabelGraph)
	r.Get("/labels/{id}/contents", m.getContentsForLabel)
	r.Get("/labels/{id}/map", m.getContentGraphForLabel)
}
