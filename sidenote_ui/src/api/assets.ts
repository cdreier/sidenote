import { Observable } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { map } from 'rxjs/operators'

import { Authorizer, defaultHeader, withErrorHandler } from './client'
import { OpenLinkResponse } from './dto'


export const fetchAssets = (a: Authorizer, url: string): Observable<Blob> => {
  return withErrorHandler<Blob>(
    ajax<Blob>({
      url,
      headers: defaultHeader(a),
      responseType: 'blob',
    }).pipe(
      map(r => r.response),
    ),
    a,
  )
}

export const saveCanvasOnAsset = (a: Authorizer, imageURL: string, body: string): Observable<Blob> => {
  return withErrorHandler<Blob>(
    ajax<Blob>({
      url: `${imageURL}/canvas`,
      body,
      method: 'PUT',
      headers: defaultHeader(a),
      responseType: 'blob',
    }).pipe(
      map(r => r.response),
    ),
    a,
  )
}


interface createImageResponse {
  w: number
  h: number
  id: string
}

export const createCanvasAsset = (a: Authorizer, contentID: string): Observable<createImageResponse> => {
  return withErrorHandler<createImageResponse>(
    ajax<createImageResponse>({
      url: `${SERVER_CONFIG.RootURL}/api/content/${contentID}/files/canvas`,
      body: {
        w: 800,
        h: 600,
        bg: '#ffffff',
      },
      method: 'POST',
      headers: defaultHeader(a),
    }).pipe(
      map(r => r.response),
    ),
    a,
  )
}

export const openURL = (a: Authorizer, url: string): Observable<OpenLinkResponse> => {
  return withErrorHandler<OpenLinkResponse>(
    ajax<OpenLinkResponse>({
      url: `${SERVER_CONFIG.RootURL}/api/open-link?url=${url}`,
      headers: defaultHeader(a),
    }).pipe(
      map(r => r.response),
    ),
    a,
  )
}
