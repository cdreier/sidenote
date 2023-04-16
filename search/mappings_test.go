package search

import (
	"testing"

	"github.com/blevesearch/bleve/v2"
	"github.com/stretchr/testify/assert"
)

func Test_getMappings(t *testing.T) {

	validateDocCount(t)

	titleQuery := bleve.NewQueryStringQuery("sup")
	titleSearch := bleve.NewSearchRequest(titleQuery)
	res, err := testIndex.Search(titleSearch)

	assert.NoError(t, err)
	assert.Equal(t, uint64(1), res.Total)

	mdCompleteWordQuery := bleve.NewQueryStringQuery("tolles")
	mdCompleteWordSearch := bleve.NewSearchRequest(mdCompleteWordQuery)
	mdCompleteWordRes, err := testIndex.Search(mdCompleteWordSearch)

	assert.NoError(t, err)
	assert.Equal(t, uint64(1), mdCompleteWordRes.Total)

	mdMultipleWordsQuery := bleve.NewQueryStringQuery("erstes doc")
	mdMultipleWordsSearch := bleve.NewSearchRequest(mdMultipleWordsQuery)
	mdMultipleWordsRes, err := testIndex.Search(mdMultipleWordsSearch)

	assert.NoError(t, err)
	assert.Equal(t, uint64(1), mdMultipleWordsRes.Total)

	// mdSpellingWordQuery := bleve.NewQueryStringQuery("toles")
	// // mdSpellingWordQuery.Fuzziness = 100
	// mdSpellingWordSearch := bleve.NewSearchRequest(mdSpellingWordQuery)
	// mdSpellingWordRes, err := testIndex.Search(mdSpellingWordSearch)

	// assert.NoError(t, err)
	// assert.Equal(t, uint64(1), mdSpellingWordRes.Total)

	mdQuery := bleve.NewQueryStringQuery("toll")
	mdSearch := bleve.NewSearchRequest(mdQuery)
	mdRes, err := testIndex.Search(mdSearch)

	assert.NoError(t, err)
	assert.Equal(t, uint64(1), mdRes.Total)
}

func Test_searchForContentType(t *testing.T) {

	validateDocCount(t)

	q := bleve.NewQueryStringQuery("+type:content +yay")
	s := bleve.NewSearchRequest(q)
	res, err := testIndex.Search(s)

	assert.NoError(t, err)
	assert.Equal(t, uint64(1), res.Total)

}

func Test_searchForLabelType(t *testing.T) {

	validateDocCount(t)

	q2 := bleve.NewQueryStringQuery("+type:label +name:yay")
	s2 := bleve.NewSearchRequest(q2)
	s2.Fields = []string{"name", "type"}
	err := s2.Validate()
	assert.NoError(t, err)
	res2, err := testIndex.Search(s2)

	assert.NoError(t, err)
	assert.Equal(t, uint64(1), res2.Total)
	assert.Equal(t, "yay", res2.Hits[0].ID)
}

func Test_searchAllFor(t *testing.T) {

	validateDocCount(t)

	// all fields
	q3 := bleve.NewQueryStringQuery("wtf")
	s3 := bleve.NewSearchRequest(q3)
	s3.Fields = []string{"title", "type"}
	res3, err := testIndex.Search(s3)

	assert.NoError(t, err)
	assert.Equal(t, uint64(2), res3.Total)
	assert.Equal(t, "wtf", res3.Hits[0].ID)
}

func Test_contentAndLabel(t *testing.T) {

	validateDocCount(t)

	q := bleve.NewQueryStringQuery("wtf")
	s := bleve.NewSearchRequest(q)
	res, err := testIndex.Search(s)

	assert.NoError(t, err)
	assert.Equal(t, uint64(2), res.Total)

}
