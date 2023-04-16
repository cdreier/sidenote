import { action, makeObservable, observable } from 'mobx'
import { graphData } from 'react-graph-vis'

import { graphs } from '../api'
import { SmallContent } from '../api/dto'
import Auth from './Auth'
import Cache from './Cache'

class LabelGraph {

  @observable
  graph: graphData | null = null

  @observable
  label: string = ''

  @observable
  contents: SmallContent[] = []

  auth: Auth

  cache: Cache

  constructor(a: Auth, c: Cache) {
    makeObservable(this)
    this.auth = a
    this.cache = c
  }

  @action
  clear() {
    this.graph = null
  }

  @action
  update(label: string) {
    this.label = label
    this.graph = null
    this.contents = []
    graphs.contentGraphForLabel(this.auth, label).subscribe(r => {
      this.graph = r
    })
    graphs.labelContents(this.auth, label).subscribe(r => {
      this.contents = r.data
    })
  }
}

export default LabelGraph