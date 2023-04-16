import { action, autorun, computed, makeObservable, observable } from 'mobx'
import { Subject } from 'rxjs'
import { debounceTime, filter, switchMap } from 'rxjs/operators'

import * as api from '../api/index'
import { SearchResult } from '../api/search'
import Auth from './Auth'

export interface SelectedSearchResult {
  id: string
  title: string
  type: string
}


class SearchHandler {

  @observable
  searches: Map<string, SearchModel> = new Map()

  auth: Auth

  constructor(a: Auth) {
    makeObservable(this)
    this.auth = a
  }

  // defaults is always the first result entry
  getSearch(searchID: string, defaults: string = ''): SearchModel {
    if (this.searches.has(searchID)) {
      return this.searches.get(searchID) as SearchModel
    }
    const s = new SearchModel(this.auth)
    s.id = searchID
    s.defaults = defaults
    this.searches.set(searchID, s)
    return s
  }

  rm(id: string) {
    this.searches.delete(id)
  }

  @computed
  get searchOpen(): boolean {
    const hits = Array.from(this.searches.values())
      .filter(s => s.result.total_hits > 0)
    return hits.length > 0
  }

}

class SearchModel {

  @observable term: string = ''
  @observable result: SearchResult = {
    total_hits: 0,
  } as SearchResult

  id: string = ''

  defaults: string = ''

  searcher: Subject<string> = new Subject()
  selected: Subject<SelectedSearchResult> = new Subject()

  auth: Auth

  constructor(a: Auth) {
    makeObservable(this)
    this.auth = a

    autorun(() => {
      this.searcher.next(this.term)
    })

    this.searcher.pipe(
      filter(term => term.length > 1),
      debounceTime(700),
      switchMap(term => api.search.search(this.auth, term)),
    )
      .subscribe(c => {
        this.result = c
        this.applyDefaults()
      })
  }

  applyDefaults() {
    if (this.defaults === '') {
      return
    }
    this.result.total_hits++
    this.result.hits = [
      {
        index: '',
        id: this.defaults,
        score: 0,
        fragments: {},
        locations: {},
        fields: {
          title: this.defaults,
          type: '',
        },
        sort: [],
      },
      ...this.result.hits,
    ]
  }


  @action
  clear() {
    this.term = ''
    this.result = {
      total_hits: 0,
    } as SearchResult
  }

}


export default SearchHandler

export {
  SearchModel,
}