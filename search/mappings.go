package search

import (
	"drailing.net/sidenote/logger"
	"github.com/blevesearch/bleve/v2"
	"github.com/blevesearch/bleve/v2/analysis/analyzer/custom"
	"github.com/blevesearch/bleve/v2/analysis/analyzer/keyword"
	"github.com/blevesearch/bleve/v2/analysis/lang/en"
	"github.com/blevesearch/bleve/v2/analysis/token/edgengram"
	"github.com/blevesearch/bleve/v2/analysis/token/lowercase"
	"github.com/blevesearch/bleve/v2/analysis/token/porter"
	"github.com/blevesearch/bleve/v2/analysis/tokenizer/unicode"
	"github.com/blevesearch/bleve/v2/mapping"
)

func getMappings() *mapping.IndexMappingImpl {

	plaintxtMapping := bleve.NewTextFieldMapping()
	plaintxtMapping.Analyzer = "fulltext"

	keywordMapping := bleve.NewTextFieldMapping()
	keywordMapping.Analyzer = keyword.Name

	typefieldMapping := bleve.NewTextFieldMapping()
	typefieldMapping.Analyzer = keyword.Name

	ignored := bleve.NewDocumentDisabledMapping()
	// reusable mappings: done

	contentMapping := bleve.NewDocumentMapping()
	contentMapping.AddFieldMappingsAt("md", plaintxtMapping)
	contentMapping.AddFieldMappingsAt("abstract", plaintxtMapping)
	contentMapping.AddFieldMappingsAt("title", plaintxtMapping)
	contentMapping.AddFieldMappingsAt("labels", keywordMapping)
	contentMapping.AddSubDocumentMapping("links", ignored)
	contentMapping.AddSubDocumentMapping("backlinks", ignored)
	contentMapping.AddSubDocumentMapping("assets", ignored)
	contentMapping.AddFieldMappingsAt("type", typefieldMapping) // type field cannot be json="-" !!!

	labelMapping := bleve.NewDocumentMapping()
	labelMapping.AddFieldMappingsAt("name", keywordMapping)
	labelMapping.AddFieldMappingsAt("type", typefieldMapping)

	mapping := bleve.NewIndexMapping()
	mapping.TypeField = "Type"
	mapping.AddDocumentMapping(INDEX_TYPE_CONTENT, contentMapping)
	mapping.AddDocumentMapping(INDEX_TYPE_LABEL, labelMapping)

	mapping.DefaultAnalyzer = "en"

	err := mapping.AddCustomTokenFilter("edgeNgram325",
		map[string]interface{}{
			"type": edgengram.Name,
			"min":  3.0,
			"max":  25.0,
		})

	if err != nil {
		logger.Get().Fatalw("unable to build edgeNgram325 analyzer", "err", err)
	}

	err = mapping.AddCustomAnalyzer("fulltext",
		map[string]interface{}{
			"type":      custom.Name,
			"tokenizer": unicode.Name,
			"token_filters": []string{
				en.PossessiveName,
				lowercase.Name,
				porter.Name,
				"edgeNgram325",
			},
		})

	if err != nil {
		logger.Get().Fatalw("unable to build fulltext analyzer", "err", err)
	}

	return mapping
}
