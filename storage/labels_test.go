package storage

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestStorage_GetLabelConnections(t *testing.T) {
	type args struct {
		name string
	}
	tests := []struct {
		name    string
		args    args
		want    GraphData
		wantErr bool
	}{
		{
			name: "found one",
			args: args{
				name: "label1",
			},
			wantErr: false,
			want: GraphData{
				Nodes: []Node{
					{
						ID:    "asdf",
						Label: "asdf",
					},
					{
						ID:    "label1",
						Label: "label1",
					},
				},
				Edges: []Edge{
					{
						From: "asdf",
						To:   "label1",
					},
					{
						From: "label1",
						To:   "asdf",
					},
				},
			},
		},
		{
			name: "found more",
			args: args{
				name: "asdf",
			},
			wantErr: false,
			want: GraphData{
				Nodes: []Node{
					{
						ID:    "asdf",
						Label: "asdf",
					},
					{
						ID:    "label1",
						Label: "label1",
					},
					{
						ID:    "somethingelse",
						Label: "somethingelse",
					},
				},
				Edges: []Edge{
					{
						From: "asdf",
						To:   "somethingelse",
					},
					{
						From: "label1",
						To:   "asdf",
					},
					{
						From: "somethingelse",
						To:   "asdf",
					},
				},
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := new(Storage)
			s.db = testDB

			got, err := s.GetLabelConnections(context.Background(), tt.args.name)
			if (err != nil) != tt.wantErr {
				t.Errorf("Storage.GetLabelConnections() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			for i, n := range tt.want.Nodes {
				assert.Equal(t, n, got.Nodes[i])
			}
			for i, e := range tt.want.Edges {
				assert.Equal(t, e.From, got.Edges[i].From)
				assert.Equal(t, e.To, got.Edges[i].To, "checking edges [to] connection")
			}
		})
	}
}
