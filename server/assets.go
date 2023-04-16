//go:build snbin || standalone

package server

import (
	"html/template"
	"io/fs"
	"io/ioutil"
	"net/http"
	"strings"

	"drailing.net/sidenote/sidenote_ui"
	"github.com/go-chi/chi/v5"
)

func handleAssets(r *chi.Mux, cfg ServerConfig) {

	rootFolder, _ := fs.Sub(sidenote_ui.Build, "production/dist")
	fileHandler := http.FileServer(http.FS(rootFolder))

	indexFile, _ := rootFolder.Open("index.html")
	defer indexFile.Close()
	indexContent, _ := ioutil.ReadAll(indexFile)
	indexTmpl, _ := template.New("root").Parse(string(indexContent))

	r.HandleFunc("/*", func(w http.ResponseWriter, r *http.Request) {
		_, err := rootFolder.Open(strings.TrimPrefix(r.URL.Path, "/"))

		if err != nil {
			indexTmpl.Execute(w, reactConfig{
				NoAuth:     cfg.NoAuth,
				RootURL:    cfg.RootURL,
				AuthConfig: cfg.Auth,
				Version:    cfg.Version,
			})
		} else {
			fileHandler.ServeHTTP(w, r)
		}
	})

}
