package storage

import (
	"context"
	"fmt"

	"drailing.net/sidenote/logger"
)

func (s *Storage) GetWorldMapGraph(ctx context.Context, includeLabelConnections []string) (GraphData, error) {
	var all []Content
	err := s.db.Find(&all, nil)
	if err != nil {
		return GraphData{}, err
	}

	g := GraphData{}
	g.Nodes = make([]Node, 0)
	g.Edges = make([]Edge, 0)

	for _, c := range all {
		// add all documents as node
		g.Nodes = append(g.Nodes, Node{
			ID:    c.ID,
			Label: c.Title,
		})

		// add all links as edges
		for _, l := range c.Links {
			g.Edges = append(g.Edges, Edge{
				From:  c.ID,
				To:    l,
				Title: "Link",
			})
		}

		for _, l := range c.Labels {
			if !includes(includeLabelConnections, l) {
				continue
			}
			tmp, err := s.GetContentForLabel(ctx, l)
			if err != nil {
				logger.FromContext(ctx).Warnw("unable to resolve content for label", "label", l, "err", err)
				continue
			}

			for _, cl := range tmp {
				if c.ID == cl.ID {
					continue
				}

				g.AppendUniqEdge(Edge{
					From:  c.ID,
					To:    cl.ID,
					Title: fmt.Sprintf("Label: %s", l),
				})
			}

		}

	}

	return g, nil
}
