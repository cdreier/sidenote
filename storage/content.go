package storage

import (
	"context"
	"time"

	"drailing.net/sidenote/logger"
	"github.com/google/uuid"
	"github.com/timshannon/bolthold"
)

func (s *Storage) StoreContent(ctx context.Context, c *Content) error {
	if c.ID == "" {
		c.ID = uuid.New().String()
		c.CreatedAt = time.Now()
		c.UpdatedAt = time.Now()

		s.db.Insert(c.ID, c)
	}

	var tmp Content
	err := s.db.Get(c.ID, &tmp)
	if err != nil {
		return err
	}

	// add backlinks to others
	for _, l := range c.Links {
		var toBacklink Content
		err := s.db.Get(l, &toBacklink)
		if err != nil {
			logger.Get().Debugw("received link with ID not found?", "err", err.Error())
			continue
		}
		toBacklink.Backlinks = appendIfNotPresent(toBacklink.Backlinks, c.ID)
		s.db.Update(l, &toBacklink)
	}

	// check for missing links and remove correspindong backlinks
	diff := difference(tmp.Links, c.Links)
	s.removeBacklinks(ctx, diff, c.ID)

	// merge assets
	if c.Assets == nil {
		c.Assets = make(map[string]Asset)
	}
	if tmp.Assets == nil {
		tmp.Assets = make(map[string]Asset)
	}
	for k, v := range tmp.Assets {
		// only overwrite non existing assets to allow overwriting and updates
		if _, found := c.Assets[k]; !found {
			c.Assets[k] = v
		}
	}
	c.CreatedAt = tmp.CreatedAt
	c.UpdatedAt = time.Now()

	return s.db.Update(c.ID, c)
}

func (s *Storage) Count(ctx context.Context) (int, error) {
	return s.db.Count(new(Content), nil)
}

func (s *Storage) GetLatest(ctx context.Context) (*Content, error) {
	var c Content
	err := s.db.FindOne(&c, bolthold.Where("UpdatedAt").Le(time.Now()).SortBy("UpdatedAt").Reverse())
	return &c, err
}

type ListDirection string

const ListDirectionForward = "f"
const ListDirectionBackward = "b"

func (s *Storage) ListContent(ctx context.Context, cursorID string, limit int, dir ListDirection) ([]Content, error) {
	var c []Content
	cursor := new(Content)
	// if cursor is empty, we search the very first item
	if cursorID == "" {
		q := bolthold.Query{}
		s.db.FindOne(cursor, q.SortBy("Title"))
	} else {
		cursor, _ = s.GetContent(ctx, cursorID)
	}
	// if limit
	if limit == 0 {
		limit = 10
	}

	q := bolthold.Where("Title").Ge(cursor.Title).SortBy("Title")
	if dir == ListDirectionBackward {
		q = bolthold.Where("Title").Le(cursor.Title).SortBy("Title").Reverse()
	}

	err := s.db.Find(&c, q.Limit(limit))
	// err := s.db.FindOne(&c, bolthold.Where("UpdatedAt").Le(time.Now()).SortBy("UpdatedAt").Reverse())
	return c, err
}

func (s *Storage) GetContent(ctx context.Context, id string) (*Content, error) {
	var c Content
	err := s.db.Get(id, &c)
	return &c, err
}

func (s *Storage) DeleteContent(ctx context.Context, id string) error {
	var toDelete Content
	err := s.db.Get(id, &toDelete)
	if err != nil {
		return err
	}

	s.removeBacklinks(ctx, toDelete.Links, toDelete.ID)

	return s.db.Delete(id, new(Content))
}

func (m *Storage) Close() {
	defer m.db.Close()
}

func (s *Storage) removeBacklinks(ctx context.Context, links []string, toRemove string) {

	for _, id := range links {
		var rmBacklink Content
		err := s.db.Get(id, &rmBacklink)
		if err != nil {
			logger.FromContext(ctx).Debugw("tried to remove backlink for non existing id?", "err", err.Error())
			continue
		}
		keep := make([]string, 0)
		for _, bid := range rmBacklink.Backlinks {
			if bid != toRemove {
				keep = append(keep, bid)
			}
		}
		rmBacklink.Backlinks = keep
		s.StoreContent(ctx, &rmBacklink)
	}
}

func (s *Storage) GetContentConnections(ctx context.Context, contentID string) (GraphData, error) {
	c, err := s.GetContent(ctx, contentID)
	if err != nil {
		return GraphData{}, err
	}

	g := GraphData{}
	g.Nodes = make([]Node, 0)
	g.Edges = make([]Edge, 0)

	g.AppendNode(Node{
		ID:    c.ID,
		Label: c.Title,
	})

	for _, l := range c.Links {
		tmp, err := s.GetContent(ctx, l)
		if err != nil {
			logger.FromContext(ctx).Warnw("unable to resolve linked content", "id", l, "err", err)
			continue
		}
		g.AppendNode(Node{
			ID:    l,
			Label: tmp.Title,
		})
		g.Edges = append(g.Edges, Edge{
			From:  c.ID,
			To:    l,
			Title: "Link",
		})
	}

	for _, l := range c.Backlinks {
		tmp, err := s.GetContent(ctx, l)
		if err != nil {
			logger.FromContext(ctx).Warnw("unable to resolve linked content", "id", l, "err", err)
			continue
		}
		g.AppendNode(Node{
			ID:    l,
			Label: tmp.Title,
		})
		g.Edges = append(g.Edges, Edge{
			From:  l,
			To:    c.ID,
			Title: "Backlink",
		})
	}

	for _, l := range c.Labels {
		tmp, err := s.GetContentForLabel(ctx, l)
		if err != nil {
			logger.FromContext(ctx).Warnw("unable to resolve content for label", "label", l, "err", err)
			continue
		}
		for _, c2 := range tmp {
			if c.ID == c2.ID {
				continue
			}
			g.AppendNode(Node{
				ID:    c2.ID,
				Label: c2.Title,
			})
		}
	}

	return g, nil
}
