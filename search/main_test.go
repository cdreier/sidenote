package search

import (
	"log"
	"os"
	"testing"

	"drailing.net/sidenote/storage"
	"github.com/blevesearch/bleve/v2"
	"github.com/blevesearch/bleve/v2/index/scorch"
	"github.com/stretchr/testify/assert"
)

func TestMain(m *testing.M) {

	setup()

	exitCode := m.Run()

	tearDown()

	os.Exit(exitCode)
}

var (
	testIndex bleve.Index
)

const testIndexPath = "./testIndex.bleve"

func validateDocCount(t *testing.T) {
	count, _ := testIndex.DocCount()
	assert.Equal(t, uint64(4), count)
}

func setup() {
	os.RemoveAll(testIndexPath)
	var err error
	testIndex, err = bleve.Open(testIndexPath)
	if err == bleve.ErrorIndexPathDoesNotExist {
		testIndex, err = bleve.NewUsing(testIndexPath, getMappings(), scorch.Name, scorch.Name, nil)
	}
	if err != nil {
		log.Fatal("unable to setup test", err)
	}
	err = testIndex.Index("1", storage.Content{
		Title: "das wird super",
		MD:    "# yay \n das ist mein tolles erstes doc ",
		Type:  INDEX_TYPE_CONTENT,
	})
	if err != nil {
		log.Fatal("unable to setup test", err)
	}
	err = testIndex.Index("2", storage.Content{
		Title:  "two labels",
		MD:     "# something with why",
		Labels: []string{"yay", "wtf"},
		Type:   INDEX_TYPE_CONTENT,
	})
	if err != nil {
		log.Fatal("unable to setup test", err)
	}
	err = testIndex.Index("yay", storage.Label{
		Name: "yay",
		Type: INDEX_TYPE_LABEL,
	})
	if err != nil {
		log.Fatal("unable to setup test", err)
	}
	err = testIndex.Index("wtf", storage.Label{
		Name: "wtf",
		Type: INDEX_TYPE_LABEL,
	})
	if err != nil {
		log.Fatal("unable to setup test", err)
	}
}

func tearDown() {
	testIndex.Close()
	err := os.RemoveAll(testIndexPath)
	if err != nil {
		log.Println("unable to delete", err)
	}
}

func Test_getType(t *testing.T) {
	type args struct {
		myvar interface{}
	}
	tests := []struct {
		name string
		args args
		want string
	}{
		{
			name: "content",
			args: args{
				myvar: storage.Content{},
			},
			want: "Content",
		},
		{
			name: "label",
			args: args{
				myvar: storage.Label{},
			},
			want: "Label",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := getType(tt.args.myvar); got != tt.want {
				t.Errorf("getType() = %v, want %v", got, tt.want)
			}
		})
	}
}
