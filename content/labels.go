package content

import (
	"context"

	"drailing.net/sidenote/logger"
)

func (m *ContentModule) updateLabels(ctx context.Context, labels []string) {
	for _, name := range labels {
		l, err := m.store.StoreLabel(ctx, name)
		if err != nil {
			logger.FromContext(ctx).Debugw("unable to store label", "name", name, "err", err)
			continue
		}
		m.indexer.Index(ctx, name, *l)
	}
}
