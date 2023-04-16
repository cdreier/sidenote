package storage

import (
	"fmt"
	"log"
	"os"

	"github.com/timshannon/bolthold"
)

type Storage struct {
	db *bolthold.Store
}

func NewStorage(dataDir string) *Storage {

	EnsureDir(fmt.Sprintf("./%s", dataDir))
	EnsureDir(fmt.Sprintf("./%s/content", dataDir))
	store, err := bolthold.Open(fmt.Sprintf("./%s/content/content.db", dataDir), 0644, nil)
	if err != nil {
		log.Fatal("failed to connect database", err.Error())
	}

	s := new(Storage)
	s.db = store

	return s
}

func EnsureDir(dir string) {
	if !DirExist(dir) {
		err := os.Mkdir(dir, 0755)
		if err != nil {
			log.Fatal(err)
		}
	}
}

func DirExist(dir string) bool {
	_, err := os.Stat(dir)
	if err == nil {
		return true
	}
	return !os.IsNotExist(err)
}
