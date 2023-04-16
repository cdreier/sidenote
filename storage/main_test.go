package storage

import (
	"log"
	"os"
	"testing"

	"github.com/timshannon/bolthold"
)

func TestMain(m *testing.M) {

	setup()

	exitCode := m.Run()

	tearDown()

	os.Exit(exitCode)
}

var (
	testDB *bolthold.Store
)

const testDBPath = "./testDB.bleve"

func setup() {
	var err error
	testDB, err = bolthold.Open(testDBPath, 0644, nil)
	if err != nil {
		log.Fatal(err)
	}

	// content with labels
	c := new(Content)
	c.ID = "111"
	c.Title = "a"
	c.Labels = []string{
		"label1",
		"asdf",
	}

	c2 := new(Content)
	c2.ID = "222"
	c2.Title = "b"
	c2.Labels = []string{
		"somethingelse",
		"asdf",
	}

	c3 := new(Content)
	c3.ID = "333"
	c3.Title = "c"

	c4 := new(Content)
	c4.ID = "444"
	c4.Title = "d"

	c5 := new(Content)
	c5.ID = "555"
	c5.Title = "e"

	testDB.Insert(c.ID, c)
	testDB.Insert(c2.ID, c2)
	testDB.Insert(c3.ID, c3)
	testDB.Insert(c4.ID, c4)
	testDB.Insert(c5.ID, c5)
}

func tearDown() {
	err := os.RemoveAll(testDBPath)
	if err != nil {
		log.Println("unable to delete", err)
	}
}
