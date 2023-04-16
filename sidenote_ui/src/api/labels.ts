import { Observable } from 'rxjs'
import { ajax } from 'rxjs/ajax'

import { Authorizer, defaultHeader, withErrorHandler } from './client'
import { Label } from './dto'


const allLabels = (a: Authorizer): Observable<Label[]> => {
  return withErrorHandler<Label[]>(
    ajax.getJSON<Label[]>(`${SERVER_CONFIG.RootURL}/api/content/labels`, defaultHeader(a)),
    a,
  )
}

export {
  allLabels,
}