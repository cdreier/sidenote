import { graphData } from 'react-graph-vis'
import { EMPTY, Observable } from 'rxjs'
import { ajax } from 'rxjs/ajax'

import { Authorizer, defaultHeader } from './client'
import { SmallContent } from './dto'

const labelGraph = (a: Authorizer, name: string): Observable<graphData> => {
  if (name === '') {
    return EMPTY
  }
  return ajax.getJSON(`${SERVER_CONFIG.RootURL}/api/network/labels/${name}`, defaultHeader(a))
}

const contentGraph = (a: Authorizer, labelFilter: string[] = []): Observable<graphData> => {
  return ajax.getJSON(`${SERVER_CONFIG.RootURL}/api/network/contents/map?include_labels=${labelFilter.join(',')}`, defaultHeader(a))
}

const singleContentGraph = (a: Authorizer, id: string): Observable<graphData> => {
  if (id === '') {
    return EMPTY
  }
  return ajax.getJSON(`${SERVER_CONFIG.RootURL}/api/network/contents/map/${id}`, defaultHeader(a))
}

const contentGraphForLabel = (a: Authorizer, label: string): Observable<graphData> => {
  if (label === '') {
    return EMPTY
  }
  return ajax.getJSON(`${SERVER_CONFIG.RootURL}/api/network/labels/${label}/map`, defaultHeader(a))
}

interface labelContentsResponse {
  data: SmallContent[]
}

const labelContents = (a: Authorizer, name: string): Observable<labelContentsResponse> => {
  if (name === '') {
    return EMPTY
  }
  return ajax.getJSON(`${SERVER_CONFIG.RootURL}/api/network/labels/${name}/contents`, defaultHeader(a))
}


export {
  contentGraphForLabel,
  labelGraph,
  labelContents,
  contentGraph,
  singleContentGraph,
}