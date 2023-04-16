package auth

import (
	"net/url"

	"github.com/google/uuid"
)

type publicAuth struct {
	codes map[string]*url.URL // hash / url
}

var PublicURLs = new(publicAuth)

func init() {
	PublicURLs.codes = make(map[string]*url.URL)
}

const PUBLIC_QUERY_STRING = "hash"

type PublicAuthResponse struct {
	Hash string `json:"-"`
	URL  string `json:"url,omitempty"`
}

func (p *publicAuth) Auth(r *url.URL) PublicAuthResponse {
	hash := uuid.New().String()
	qVals := r.Query()
	qVals.Add(PUBLIC_QUERY_STRING, hash)
	r.RawQuery = qVals.Encode()
	p.codes[hash] = r
	return PublicAuthResponse{
		Hash: hash,
		URL:  r.String(),
	}
}
