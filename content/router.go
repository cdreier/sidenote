package content

import (
	"github.com/go-chi/chi/v5"
)

func (m *ContentModule) Router(r chi.Router) {

	r.Get("/", m.listingHandler)
	r.Get("/labels", m.listLabelsHandler)
	r.Get("/latest", m.getLatestHandler)
	r.Get("/{id}", m.getDocumentHandler)
	r.Delete("/{id}", m.deleteContentHandler)
	r.Post("/", m.saveHandler)
	r.Post("/{id}/files", m.getFileUploadHandler)
	// r.Post("/{id}/network", m.getNetworkHandler)
	r.Get("/{id}/files/{fid}", m.getAssetHandler)
	r.Put("/{id}/files/{fid}/canvas", m.AddCanvasToAssetHandler)
	r.Post("/{id}/files/canvas", m.CreateCanvasAssetHandler)

}
