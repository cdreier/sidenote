package content

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"image"
	_ "image/jpeg"
	"image/png"
	"io"
	"log"
	"net/http"
	"strconv"
	"strings"

	apierrors "drailing.net/sidenote/api-errors"
	"drailing.net/sidenote/logger"
	"drailing.net/sidenote/storage"
	"github.com/fogleman/gg"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func (m *ContentModule) saveHandler(w http.ResponseWriter, r *http.Request) {

	log := logger.FromRequest(r)

	var c storage.Content
	json.NewDecoder(r.Body).Decode(&c)
	log.Debugw("saving", "id", c.ID)

	err := apierrors.ValidateStruct(c)
	if err != nil {
		log.Warnw("validation error", "err", err)
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(err)
		return
	}

	// store content
	err = m.store.StoreContent(r.Context(), &c)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		log.Errorw("validation error", "err", err)
		json.NewEncoder(w).Encode(err)
		return
	}
	m.indexer.Index(r.Context(), c.ID, c)

	// store labels
	m.updateLabels(r.Context(), c.Labels)

	json.NewEncoder(w).Encode(c)
}

func (m *ContentModule) getLatestHandler(w http.ResponseWriter, r *http.Request) {

	log := logger.FromRequest(r)

	c, err := m.store.GetLatest(r.Context())
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("{}"))
		log.Infow("latest item not found", "err", err)
		return
	}

	json.NewEncoder(w).Encode(c)
}

func (m *ContentModule) listLabelsHandler(w http.ResponseWriter, r *http.Request) {
	list, _ := m.store.GetLabels(r.Context())
	json.NewEncoder(w).Encode(list)
}

func (m *ContentModule) listingHandler(w http.ResponseWriter, r *http.Request) {

	log := logger.FromRequest(r)

	cursor := r.URL.Query().Get("cursor")
	direction := r.URL.Query().Get("dir")
	limit, _ := strconv.ParseInt(r.URL.Query().Get("limit"), 10, 32)
	if limit == 0 {
		limit = 10
	}
	if direction == "" {
		direction = "f"
	}

	c, err := m.store.ListContent(r.Context(), cursor, int(limit), storage.ListDirection(direction))
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("{}"))
		log.Infow("unable to list", "err", err)
		return
	}

	count, _ := m.store.Count(r.Context())

	sm := storage.ToSmallContents(c)
	json.NewEncoder(w).Encode(struct {
		Data  []storage.SmallContent `json:"data"`
		Count int                    `json:"count"`
	}{
		Data:  sm,
		Count: count,
	})
}

func (m *ContentModule) getDocumentHandler(w http.ResponseWriter, r *http.Request) {

	log := logger.FromRequest(r)
	id := chi.URLParam(r, "id")
	c, err := m.store.GetContent(r.Context(), id)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("{}"))
		log.Infow("item not found", "err", err, "id", id)
		return
	}

	json.NewEncoder(w).Encode(c)
}

type fileUpload struct {
	File string `json:"file,omitempty"`
}

func (f *fileUpload) Mime() string {
	parts := strings.Split(f.File, ";base64,")
	if len(parts) != 2 {
		return ""
	}
	return strings.Replace(parts[0], "data:", "", 1)
}

func (f *fileUpload) FileContent() string {
	parts := strings.Split(f.File, ";base64,")
	if len(parts) != 2 {
		return ""
	}
	return parts[1]
}

type createImagePayload struct {
	W  int    `json:"w,omitempty"`
	H  int    `json:"h,omitempty"`
	BG string `json:"bg,omitempty"`
}

type createImageResponse struct {
	ID string `json:"id,omitempty"`
	W  int    `json:"w,omitempty"`
	H  int    `json:"h,omitempty"`
}

func (m *ContentModule) CreateCanvasAssetHandler(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	c, err := m.store.GetContent(r.Context(), id)
	if err != nil {
		http.Error(w, "content not found", http.StatusNotFound)
		return
	}

	data := createImagePayload{}
	json.NewDecoder(r.Body).Decode(&data)

	dc := gg.NewContext(data.W, data.H)
	dc.DrawRectangle(0, 0, float64(data.W), float64(data.H))
	dc.SetHexColor(data.BG)
	dc.Fill()

	buf := new(bytes.Buffer)
	err = dc.EncodePNG(buf)
	if err != nil {
		http.Error(w, "unable to encode image", http.StatusInternalServerError)
		return
	}

	imgID := uuid.New()

	asset := storage.Asset{
		Bytes:    buf.Bytes(),
		Mime:     "image/png",
		Original: buf.Bytes(),
		ID:       imgID.String(),
		Width:    data.W,
		Height:   data.H,
	}

	c.Assets[asset.ID] = asset
	err = m.store.StoreContent(r.Context(), c)
	if err != nil {
		http.Error(w, "unable to store content with asset", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(createImageResponse{
		ID: asset.ID,
		W:  asset.Width,
		H:  asset.Height,
	})
}

func (m *ContentModule) AddCanvasToAssetHandler(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	fid := chi.URLParam(r, "fid")

	canvas, _ := io.ReadAll(r.Body)

	parts := strings.SplitN(string(canvas), ",", 2)
	if len(parts) != 2 {
		http.Error(w, "invalid image data", http.StatusBadRequest)
		return
	}

	c, err := m.store.GetContent(r.Context(), id)

	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	asset := c.Assets[fid]
	assetImage, err := asset.GetImage()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	data := parts[1]
	unbased, _ := base64.StdEncoding.DecodeString(data)
	canvasImage, err := png.Decode(bytes.NewReader(unbased))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	dc := gg.NewContextForImage(assetImage)
	dc.DrawImage(canvasImage, 0, 0)

	buf := new(bytes.Buffer)
	err = dc.EncodePNG(buf)
	if err != nil {
		http.Error(w, "unable to encode image", http.StatusInternalServerError)
		return
	}

	asset.Bytes = buf.Bytes()
	asset.Mime = "image/png"
	c.Assets[fid] = asset
	err = m.store.StoreContent(r.Context(), c)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

}

func (m *ContentModule) getAssetHandler(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	fid := chi.URLParam(r, "fid")

	c, err := m.store.GetContent(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	asset := c.Assets[fid]
	// img, t, err := image.Decode(bytes.NewReader(asset.Bytes))

	w.Header().Set("Content-Type", asset.Mime)
	w.Header().Set("Content-Length", strconv.Itoa(len(asset.Bytes)))
	if _, err := w.Write(asset.Bytes); err != nil {
		log.Println("unable to write image.")
	}

}

func (m *ContentModule) getFileUploadHandler(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	c, err := m.store.GetContent(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var upload fileUpload
	json.NewDecoder(r.Body).Decode(&upload)

	content := upload.FileContent()
	fileBytes, err := base64.StdEncoding.DecodeString(content)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	// just try to find w and h
	clean := bytes.NewReader(fileBytes)
	conf, _, _ := image.DecodeConfig(clean)

	if c.Assets == nil {
		c.Assets = make(map[string]storage.Asset)
	}

	assetID := uuid.New().String()
	fileAsset := storage.Asset{
		ID:       assetID,
		Bytes:    fileBytes,
		Original: fileBytes,
		Mime:     upload.Mime(),
		Width:    conf.Width,
		Height:   conf.Height,
	}
	c.Assets[assetID] = fileAsset

	err = m.store.StoreContent(r.Context(), c)
	if err != nil {
		logger.Get().Warnw("unable to store content with asset", "err", err.Error())
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(struct {
		ID   string `json:"id,omitempty"`
		Mime string `json:"mime,omitempty"`
	}{
		ID:   assetID,
		Mime: fileAsset.Mime,
	})

}

func (m *ContentModule) deleteContentHandler(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	m.indexer.Delete(r.Context(), id)
	err := m.store.DeleteContent(r.Context(), id)
	if err != nil {
		logger.FromRequest(r).Errorw("unable to delete content", "id", id, "err", err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}
