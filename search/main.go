package search

import (
	"context"
	"fmt"
	"reflect"

	"drailing.net/sidenote/logger"
	"drailing.net/sidenote/storage"
	"github.com/blevesearch/bleve/v2"
	"github.com/blevesearch/bleve/v2/index/scorch"
	"github.com/cdreier/golang-snippets/snippets"
)

type Search struct {
	index bleve.Index
}

var (
	INDEX_TYPE_CONTENT = "content"
	INDEX_TYPE_LABEL   = "label"
)

const indexPath = "./%s/search/index.bleve"

func NewSearch(dataDir string) *Search {
	snippets.EnsureDir(fmt.Sprintf("./%s", dataDir))
	snippets.EnsureDir(fmt.Sprintf("./%s/search", dataDir))

	s := new(Search)

	index, err := bleve.Open(fmt.Sprintf(indexPath, dataDir))
	if err == bleve.ErrorIndexPathDoesNotExist {
		index, err = bleve.NewUsing(fmt.Sprintf(indexPath, dataDir), getMappings(), scorch.Name, scorch.Name, nil)
	}
	if err != nil {
		logger.Get().Fatalw("unable to start search module", "err", err)
	}

	s.index = index

	return s
}

func (s *Search) Index(ctx context.Context, id string, obj interface{}) {

	log := logger.FromContext(ctx)
	t := getType(obj)
	var err error
	switch t {
	case "Content":
		c := obj.(storage.Content)
		c.Type = INDEX_TYPE_CONTENT
		err = s.index.Index(id, c)
		log.Debugw("indexing", "type", c.Type, "id", id)
	case "Label":
		c := obj.(storage.Label)
		c.Type = INDEX_TYPE_LABEL
		err = s.index.Index(id, c)
		log.Debugw("indexing", "type", c.Type, "id", id)
	}

	go func() {
		count, _ := s.index.DocCount()
		log.Debugw("doc count", "amount", count)
	}()

	if err != nil {
		log.Errorw("unable to index", "err", err)
	}
}

func (s *Search) Find(ctx context.Context, term string) (*bleve.SearchResult, error) {

	query := bleve.NewQueryStringQuery(term)
	search := bleve.NewSearchRequest(query)
	search.Fields = []string{"title", "type"}
	search.Highlight = bleve.NewHighlight()
	return s.index.Search(search)
}

func (s *Search) Reindex(ctx context.Context) error {

	return nil
}

func (s *Search) Delete(ctx context.Context, id string) {
	log := logger.FromContext(ctx)
	err := s.index.Delete(id)
	if err != nil {
		log.Errorw("unable to delete from search index", "id", id, "err", err.Error())
	}
}

func getType(myvar interface{}) string {
	if t := reflect.TypeOf(myvar); t.Kind() == reflect.Ptr {
		return "*" + t.Elem().Name()
	} else {
		return t.Name()
	}
}
