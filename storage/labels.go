package storage

import (
	"context"
	"sort"

	"github.com/timshannon/bolthold"
)

func (s *Storage) GetLabel(ctx context.Context, name string) (*Label, error) {
	var l Label
	err := s.db.Get(name, &l)
	return &l, err
}

func (s *Storage) GetLabels(ctx context.Context) ([]*Label, error) {
	var l []*Label
	err := s.db.Find(&l, nil)
	return l, err
}

func (s *Storage) GetContentForLabel(ctx context.Context, name string) ([]Content, error) {
	res := []Content{}
	err := s.db.Find(&res, bolthold.Where("Labels").Contains(name).Index("Labels"))
	return res, err
}

func (s *Storage) GetContentGraphForLabel(ctx context.Context, name string) (GraphData, error) {
	contents, err := s.GetContentForLabel(ctx, name)
	if err != nil {
		return GraphData{}, err
	}

	g := GraphData{}
	g.Nodes = make([]Node, 0)
	g.Edges = make([]Edge, 0)

	for _, c := range contents {
		g.Nodes = append(g.Nodes, Node{
			ID:    c.ID,
			Label: c.Title,
		})

		for _, l := range c.Links {
			for _, inc := range contents {
				if l == inc.ID {
					g.Edges = append(g.Edges, Edge{
						From:  c.ID,
						To:    inc.ID,
						Title: inc.Title,
					})
				}
			}
		}

	}

	return g, nil
}

func (s *Storage) GetLabelConnections(ctx context.Context, name string) (GraphData, error) {
	contents, err := s.GetContentForLabel(ctx, name)
	if err != nil {
		return GraphData{}, err
	}

	// this is a map where labels are mapped to all the contents
	labelConnectionMap := make(map[string]Content)
	for _, c := range contents {
		for _, l := range c.Labels {
			labelConnectionMap[l] = c
		}
	}

	g := GraphData{}
	g.Nodes = make([]Node, len(labelConnectionMap))
	g.Edges = make([]Edge, 0)
	i := 0
	// iterate all labels - labels are the node
	for k := range labelConnectionMap {
		g.Nodes[i] = Node{
			ID:    k,
			Label: k,
		}
		// now iterate all the contents belongs to that label, to create the edges
		for _, t := range labelConnectionMap[k].Labels {
			if t == k {
				continue
			}
			g.Edges = append(g.Edges, Edge{
				From:  k,
				To:    t,
				Title: labelConnectionMap[k].ID,
			})
		}
		i++
	}

	sort.Slice(g.Nodes, func(n1 int, n2 int) bool {
		return g.Nodes[n1].ID < g.Nodes[n2].ID
	})

	sort.Slice(g.Edges, func(e1 int, e2 int) bool {
		return g.Edges[e1].From < g.Edges[e2].From
	})

	return g, nil
}

func (s *Storage) StoreLabel(ctx context.Context, name string) (*Label, error) {
	l := Label{
		Name:   name,
		Childs: []string{},
	}
	err := s.db.Insert(name, &l)
	if err != nil && err != bolthold.ErrKeyExists {
		return nil, err
	}
	return &l, nil
}
