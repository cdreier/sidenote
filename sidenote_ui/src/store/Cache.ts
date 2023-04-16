import { action, makeObservable, observable } from 'mobx'

import { documents } from '../api'
import Auth from './Auth'

export class Document {
  @observable id: string = ''
  @observable title: string = ''
  @observable labels: string[] = []

  constructor() {
    makeObservable(this)
  }
}

class Cache {

  @observable
  documents: Map<string, Document> = new Map()

  auth: Auth

  constructor(a: Auth) {
    makeObservable(this)
    this.auth = a
  }

  @action
  document(id: string): Document {
    if (!this.documents.has(id)) {
      this.documents.set(id, new Document())

      documents.load(this.auth, id).subscribe(d => {
        const tmp = this.documents.get(id) as Document
        tmp.id = d.id
        tmp.title = d.title
      })
    }

    return this.documents.get(id) as Document
  }


}


export default Cache