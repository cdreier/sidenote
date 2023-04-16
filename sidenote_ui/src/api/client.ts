import { EMPTY, Observable } from 'rxjs'
import { AjaxError } from 'rxjs/ajax'
import { catchError } from 'rxjs/operators'

export interface Authorizer {
  getBearerToken(): string
  refresh(): void
  errorOccured(err: AjaxError): void
}

export interface APIError {
  errors: Error[];
}

interface Error {
  msg: string;
}


export const defaultHeader = (a: Authorizer, other = {}) => {
  return Object.assign({
    Authorization: `Bearer ${a.getBearerToken()}`,
    'Content-Type': 'application/json',
  }, other)
}

interface ErrorCatcher {
  refresh(): void
  errorOccured(err: AjaxError): void
}

export const withErrorHandler = <T>(o: Observable<T>, ec: ErrorCatcher) => {
  if (!ec) {
    console.warn('no error catcher defined')
  }
  return o.pipe(
    catchError((err, o) => {
      if (err.status === 401) {  // UNAUTHORIZED 
        ec.refresh()
      } else {
        ec.errorOccured(err)
      }
      return EMPTY
    }),
  )
}
