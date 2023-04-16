import { action, makeObservable, observable } from 'mobx'
import { graphData } from 'react-graph-vis'

import { graphs, labels } from '../api'
import { SmallContent } from '../api/dto'
import Auth from './Auth'
import Cache from './Cache'



class WorldMap {

  @observable
  graph: graphData | null = null

  @observable
  selectedDoc: SmallContent = {} as SmallContent

  @observable
  labels: string[]

  auth: Auth

  cache: Cache

  constructor(a: Auth, c: Cache) {
    makeObservable(this)
    this.auth = a
    this.cache = c
    this.labels = []
  }

  fetchLabels() {
    labels.allLabels(this.auth).subscribe(res => {
      this.labels = res.map(l => l.name).sort()
    })
  }

  @action
  selectNode(id: string) {
    if (id === '') {
      this.selectedDoc = {} as SmallContent
    } else {
      this.selectedDoc = this.cache.document(id)
    }
  }

  @action
  update(labelFilter: string[] = []) {
    this.graph = null
    graphs.contentGraph(this.auth, labelFilter).subscribe(r => {
      this.graph = null
      this.graph = r
    })
  }


}

export default WorldMap