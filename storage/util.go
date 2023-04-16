package storage

import (
	"sort"
)

func includes(list []string, check string) bool {
	for _, c := range list {
		if c == check {
			return true
		}
	}
	return false
}

func appendIfNotPresent(list []string, i string) []string {
	for _, s := range list {
		if s != i {
			continue
		}
		return list
	}
	list = append(list, i)
	sort.Strings(list)
	return list
}

// difference returns the elements in `a` that aren't in `b`.
func difference(a, b []string) []string {
	mb := make(map[string]struct{}, len(b))
	for _, x := range b {
		mb[x] = struct{}{}
	}
	var diff []string
	for _, x := range a {
		if _, found := mb[x]; !found {
			diff = append(diff, x)
		}
	}
	return diff
}

func ToSmallContents(content []Content) []SmallContent {
	res := make([]SmallContent, len(content))
	for i, c := range content {
		if c.Labels == nil {
			c.Labels = []string{}
		}
		res[i] = SmallContent{
			ID:     c.ID,
			Title:  c.Title,
			Labels: c.Labels,
		}
	}
	return res
}
