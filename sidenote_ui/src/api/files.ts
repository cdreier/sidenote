import { Observable } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { map } from 'rxjs/operators'

import { Authorizer, defaultHeader } from './client'

interface FileUploadResponse {
  id: string;
  mime: string;
}

const upload = (a: Authorizer, docid: string, blob: any): Observable<FileUploadResponse> => {
  return ajax<FileUploadResponse>({
    url: `${SERVER_CONFIG.RootURL}/api/content/${docid}/files`,
    method: 'POST',
    headers: defaultHeader(a),
    body: JSON.stringify({
      file: blob,
    }),
  }).pipe(map((r) => r.response))
}

export { upload }
