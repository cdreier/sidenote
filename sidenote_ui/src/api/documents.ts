import { Observable } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { filter, map, take } from 'rxjs/operators'

import Current from '../store/Current'
import { Authorizer, defaultHeader, withErrorHandler } from './client'
import { Content, SmallContent } from './dto'


const latest = (a: Authorizer): Observable<Content> => {
  return load(a, 'latest')
}

const load = (a: Authorizer, id: string): Observable<Content> => {
  return withErrorHandler<Content>(
    ajax.getJSON<Content>(`${SERVER_CONFIG.RootURL}/api/content/${id}`, defaultHeader(a))
      .pipe(
        filter(c => c && typeof c.id === 'string' && c.id !== ''),
      ),
    a,
  )
}

interface ListingResponse {
  count: number,
  data: SmallContent[],
}

const list = (a: Authorizer, cursor: string, limit: number, dir: string = ''): Observable<ListingResponse> => {
  return withErrorHandler<ListingResponse>(
    ajax.getJSON(`${SERVER_CONFIG.RootURL}/api/content?cursor=${cursor}&limit=${limit}&dir=${dir}`, defaultHeader(a)),
    a,
  )
}

interface DocumentToSave {
  id?: string,
  title?: string,
  mdContent: string,
  labels?: string[],
  links?: string[],
  backlinks?: string[],
}

const save = (a: Authorizer, current: DocumentToSave): Observable<Content> => {

  return withErrorHandler<Content>(
    ajax<Content>({
      url: `${SERVER_CONFIG.RootURL}/api/content`,
      method: 'POST',
      headers: defaultHeader(a),
      body: JSON.stringify({
        id: current.id,
        title: current.title,
        labels: current.labels,
        md: current.mdContent,
        links: current.links,
        backlinks: current.backlinks,
      }),
    }).pipe(
      map(r => r.response),
    ),
    a,
  )

}

const remove = (a: Authorizer, current: Current): Observable<Content> => {

  return ajax<Content>({
    url: `${SERVER_CONFIG.RootURL}/api/content/${current.id}`,
    method: 'DELETE',
    headers: defaultHeader(a),
  }).pipe(
    map(r => r.response),
  )

}

export {
  latest,
  list,
  remove,
  load,
  save,
}