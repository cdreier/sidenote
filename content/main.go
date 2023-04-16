package content

import (
	"context"

	_ "embed"

	"drailing.net/sidenote/logger"
	"drailing.net/sidenote/storage"
)

type ContentModule struct {
	store   Storage
	indexer Indexer
}

type Storage interface {
	ContentStorage
	LabelStorage
}

type ContentStorage interface {
	StoreContent(ctx context.Context, c *storage.Content) error
	GetLatest(ctx context.Context) (*storage.Content, error)
	GetContent(ctx context.Context, id string) (*storage.Content, error)
	DeleteContent(ctx context.Context, id string) error
	ListContent(ctx context.Context, cursorID string, limit int, dir storage.ListDirection) ([]storage.Content, error)
	Count(ctx context.Context) (int, error)
}

type LabelStorage interface {
	GetLabel(ctx context.Context, name string) (*storage.Label, error)
	GetLabels(ctx context.Context) ([]*storage.Label, error)
	StoreLabel(ctx context.Context, name string) (*storage.Label, error)
	GetLabelConnections(ctx context.Context, name string) (storage.GraphData, error)
}

type Indexer interface {
	Index(ctx context.Context, id string, t interface{})
	Delete(ctx context.Context, id string)
}

type Searcher interface {
}

func NewContents(db Storage, indexer Indexer) *ContentModule {

	contents := new(ContentModule)
	contents.store = db
	contents.indexer = indexer

	contents.checkStartup()

	return contents
}

//go:embed init.md
var initialContentMD string

//go:embed init_link.md
var initialLinkedContentMD string

func (m *ContentModule) checkStartup() {
	count, err := m.store.Count(context.Background())
	if err != nil {
		return
	}
	if count == 0 {
		logger.Get().Info("seems to be like the first start, adding intro content object")
		linked := &storage.Content{
			Title:  "linked contend",
			MD:     initialLinkedContentMD,
			Labels: []string{"demo"},
		}
		m.store.StoreContent(context.Background(), linked)

		welcome := &storage.Content{
			Title:  "introduction to sidenote",
			MD:     initialContentMD,
			Labels: []string{"demo"},
		}
		m.store.StoreContent(context.Background(), welcome)

		m.indexer.Index(context.Background(), linked.ID, *linked)
		m.indexer.Index(context.Background(), welcome.ID, *welcome)

	}
}
