import { Observable } from 'rxjs'
import { ajax } from 'rxjs/ajax'

import { Authorizer, defaultHeader } from './client'

export interface SearchResult {
  status: Status;
  request: Request;
  hits: Hit[];
  total_hits: number;
  max_score: number;
  took: number;
}

export interface Hit {
  index: string;
  id: string;
  score: number;
  locations?: Locations;
  fragments: Fragments;
  fields: Fields;
  sort: string[];
}

export interface Fragments {
  md?: string[];
  labels?: string[];
}

export interface Fields {
  title: string;
  type: string;
}

export interface Locations {
  md?: Labels;
  labels?: Labels;
}

export interface Labels {
  nice: Nice[];
}

export interface Nice {
  pos: number;
  start: number;
  end: number;
  array_positions: number[] | null;
}

export interface Request {
  query: Query;
  size: number;
  from: number;
  highlight: Highlight;
  fields: null;
  facets: null;
  explain: boolean;
  sort: string[];
  includeLocations: boolean;
  search_after: null;
  search_before: null;
}

export interface Highlight {
  style: null;
  fields: null;
}

export interface Query {
  match: string;
  prefix_length: number;
  fuzziness: number;
}

export interface Status {
  total: number;
  failed: number;
  successful: number;
}



const search = (a: Authorizer, term: string): Observable<SearchResult> => {
  return ajax.getJSON(`${SERVER_CONFIG.RootURL}/api/search?q=${term}`, defaultHeader(a))
}

export {
  search,
}


