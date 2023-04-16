package storage

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestStorage_ListContent(t *testing.T) {

	s := new(Storage)
	s.db = testDB

	res, err := s.ListContent(context.Background(), "", 10, "f")
	assert.Nil(t, err)
	assert.GreaterOrEqual(t, len(res), 5)

	res, err = s.ListContent(context.Background(), "222", 3, "f")
	assert.Nil(t, err)
	assert.Len(t, res, 3)
	assert.Equal(t, "222", res[0].ID)
	assert.Equal(t, "444", res[2].ID)

	res, err = s.ListContent(context.Background(), "333", 3, "b")
	assert.Nil(t, err)
	assert.Len(t, res, 3)
	assert.Equal(t, "333", res[0].ID)
	assert.Equal(t, "111", res[2].ID)

	res, err = s.ListContent(context.Background(), "555", 5, "b")
	assert.Nil(t, err)
	assert.Len(t, res, 5)
	assert.Equal(t, "555", res[0].ID)
	assert.Equal(t, "111", res[4].ID)

	res, err = s.ListContent(context.Background(), "555", 10, "f")
	assert.Nil(t, err)
	assert.Len(t, res, 1)
	assert.Equal(t, "555", res[0].ID)

}

func TestStorage_StoreContent(t *testing.T) {
	s := new(Storage)
	s.db = testDB

	withLink := &Content{
		Links: []string{"111"},
		Title: "content with link",
	}
	err := s.StoreContent(context.Background(), withLink)
	assert.Nil(t, err)
	expectedBacklink, err := s.GetContent(context.Background(), "111")
	assert.Nil(t, err)
	assert.Contains(t, expectedBacklink.Backlinks, withLink.ID)

	// store other, backlink remains
	err = s.StoreContent(context.Background(), expectedBacklink)
	assert.Nil(t, err)
	assert.Contains(t, expectedBacklink.Backlinks, withLink.ID)

	// remove links
	withLink.Links = []string{}
	err = s.StoreContent(context.Background(), withLink)
	assert.Nil(t, err)
	expectedBacklink, err = s.GetContent(context.Background(), "111")
	assert.Nil(t, err)
	assert.NotContains(t, expectedBacklink.Backlinks, withLink.ID)

}
