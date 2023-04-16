package storage

import (
	"bytes"
	"errors"
	"image"
	"image/draw"
	"image/jpeg"
	"image/png"
	"time"
)

type Content struct {
	ID        string           `boltholdKey:"ID" json:"id,omitempty"`
	Title     string           `json:"title" validate:"required"`
	Abstract  string           `json:"abstract" `
	MD        string           `json:"md" validate:"required"`
	Labels    []string         `boltholdSliceIndex:"Labels" json:"labels,omitempty"`
	Links     []string         `boltholdSliceIndex:"Links" json:"links,omitempty"`
	Backlinks []string         `boltholdSliceIndex:"Backlinks" json:"backlinks,omitempty"`
	CreatedAt time.Time        `json:"created_at,omitempty"`
	UpdatedAt time.Time        `json:"updated_at,omitempty"`
	Assets    map[string]Asset `json:"-"`
	Type      string           `json:"type,omitempty"`
}

type SmallContent struct {
	ID     string   `json:"id,omitempty"`
	Title  string   `json:"title,omitempty"`
	Labels []string `json:"labels"`
}

type Asset struct {
	Bytes    []byte
	Original []byte
	Mime     string
	ID       string
	Width    int
	Height   int
}

func (a Asset) GetImage() (image.Image, error) {
	switch a.Mime {
	case "image/png":
		return png.Decode(bytes.NewReader(a.Bytes))
	case "image/jpg", "image/jpeg":
		return jpeg.Decode(bytes.NewReader(a.Bytes))
	}
	return image.NewRGBA(image.Rect(0, 0, 1, 1)), nil
}

func (a Asset) GetDrawableImage() (draw.Image, error) {
	img, err := a.GetImage()
	if err != nil {
		return nil, err
	}

	dimg, ok := img.(draw.Image)
	if !ok {
		return nil, errors.New("unable to generate drawing image")
	}

	return dimg, nil
}

type Label struct {
	Name   string `json:"name" boltholdKey:"ID"`
	Childs []string
	Type   string `json:"type,omitempty"`
}

type GraphData struct {
	Nodes []Node `json:"nodes"`
	Edges []Edge `json:"edges"`
}

func (g *GraphData) IncludesNode(nodeID string) bool {
	for _, n := range g.Nodes {
		if n.ID == nodeID {
			return true
		}
	}
	return false
}

func (g *GraphData) AppendNode(node Node) {
	if !g.IncludesNode(node.ID) {
		g.Nodes = append(g.Nodes, node)
	}
}

func (g *GraphData) AppendUniqEdge(edge Edge) {
	for _, e := range g.Edges {
		if (e.From == edge.From || e.To == edge.From) && (e.From == edge.To || e.To == edge.To) {
			return
		}
	}
	g.Edges = append(g.Edges, edge)
}

type Edge struct {
	From  string `json:"from,omitempty"`
	To    string `json:"to,omitempty"`
	Title string `json:"title,omitempty"`
}

type Node struct {
	ID    string `json:"id"`
	Label string `json:"label"`
}
