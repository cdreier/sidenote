package graphs

import (
	"context"

	"drailing.net/sidenote/storage"
)

type GraphsModule struct {
	store Storage
}

type Storage interface {
	GraphStorage
}

type GraphStorage interface {
	GetLabelConnections(ctx context.Context, name string) (storage.GraphData, error)
	GetContentForLabel(ctx context.Context, name string) ([]storage.Content, error)
	GetWorldMapGraph(ctx context.Context, includeLabelConnections []string) (storage.GraphData, error)
	GetContentConnections(ctx context.Context, contentID string) (storage.GraphData, error)
	GetContentGraphForLabel(ctx context.Context, name string) (storage.GraphData, error)
}

func NewGraphs(db Storage) *GraphsModule {

	contents := new(GraphsModule)
	contents.store = db

	return contents
}
