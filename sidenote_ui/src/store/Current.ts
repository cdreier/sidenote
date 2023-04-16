import { ContentBlock, ContentState, EditorState, Modifier, RichUtils } from 'draft-js'
import { action, autorun, computed, makeObservable, observable } from 'mobx'
import { persist } from 'mobx-persist'
import { graphData } from 'react-graph-vis'

import * as api from '../api'
import { Content } from '../api/dto'
import { insertText } from '../editor/actions/insert'
import compositeDecorator from '../editor/decorators'
import { getSelectedBlocks, getText, replaceContentMaintainSelection } from '../editor/util'
import { sidenoteHistory } from '.'
import Auth from './Auth'
import { Document } from './Cache'
import Feedback from './Feedback'

type ViewMode = 'Editor' | 'Viewer'

const emptyEditorState = (c: Current): EditorState => {
  const state = ContentState.createFromText('')
  return EditorState.createWithContent(state, compositeDecorator(c))
}

class Current {

  @observable id: string = ''
  @observable createdAt: Date = new Date(0)
  @observable updatedAt: Date = new Date(0)
  @observable labels: string[] = []
  @observable links: string[] = []
  @observable backlinks: string[] = []
  @observable title: string = ''
  @observable editorState: EditorState
  @persist @observable stageMode: ViewMode = 'Editor'

  @observable
  graph: graphData | null = null

  _labelMap: Map<string, string> = new Map()
  @observable _linkMap: Map<string, Document | null> = new Map()

  auth: Auth
  feedback: Feedback
  mainEditor: boolean

  @observable lastSavedContent: string = ''

  constructor(a: Auth, feedback: Feedback, mainEditor = true) {
    makeObservable(this)
    this.auth = a
    this.feedback = feedback
    this.mainEditor = mainEditor
    this.editorState = emptyEditorState(this)

    autorun(() => {
      const vals = Array.from(this._linkMap.values())
      const docs = vals.filter(d => (d?.id || '') !== '').map(d => d?.id || '')
      const dedup = new Set(docs)
      this.links = Array.from(dedup)
    })
  }

  get selectedBlock(): ContentBlock {
    const blocks = getSelectedBlocks(this.editorState.getCurrentContent(), this.editorState.getSelection())
    return blocks.first()
  }

  @action
  clear() {
    this.id = ''
    this.title = ''
    this.createdAt = new Date(0)
    this.updatedAt = new Date(0)
    this.labels = []
    this.links = []
    this.backlinks = []
    this.editorState = emptyEditorState(this)
    this._labelMap = new Map()

    this.graph = null

    sidenoteHistory.push('/')
  }

  save() {
    api.documents.save(this.auth, this)
      .subscribe(c => {
        this.feedback.addMessage('saved')
        this.update(c)
        this.refetchGraph(this.id)
      })
  }

  @action
  setTitle(txt: string) {
    txt = txt.replace('# ', '')
    this.title = txt
  }

  @action
  setLabel(id: string, l: string) {
    l = l.replace('@', '')
    if (l === '') {
      this._labelMap.delete(id)
    } else {
      this._labelMap.set(id, l)
    }
    const dedup = new Set(this._labelMap.values())
    this.labels = Array.from(dedup)
  }

  @action
  update(c: Content) {

    if (!c) {
      return
    }

    if (c.id !== '' && this.id !== c.id && this.mainEditor) {
      sidenoteHistory.replace(`/c/${c.id}`)
    }

    this.id = c.id
    this.title = c.title
    this.createdAt = new Date(c.created_at)
    this.updatedAt = new Date(c.updated_at)
    this.labels = c.labels || []
    this.links = c.links || []
    this.backlinks = c.backlinks || []

    this._linkMap.clear()
    const state = ContentState.createFromText(c.md)
    this.editorState = replaceContentMaintainSelection(this.editorState, state, compositeDecorator(this))

    this.lastSavedContent = this.mdContent

  }

  loadDocument(id: string) {
    api.documents.load(this.auth, id)
      .subscribe(c => this.update(c))

    this.refetchGraph(id)
  }

  refetchGraph(id: string) {
    this.graph = null
    api.graphs.singleContentGraph(this.auth, id)
      .subscribe(g => {
        this.graph = null
        this.graph = g
      })
  }

  loadLatest() {
    api.documents.latest(this.auth)
      .subscribe(c => this.update(c))
  }

  importMD(md: string) {
    this.clear()
    const state = ContentState.createFromText(md)
    this.editorState = EditorState.createWithContent(state, compositeDecorator(this))
  }

  uploadFile(blob: any) {
    api.files.upload(this.auth, this.id, blob).subscribe(res => {
      const url = `${SERVER_CONFIG.RootURL}/api/content/${this.id}/files/${res.id}`
      let replacement = `[your file](${url})`
      if (res.mime.includes('image')) {
        replacement = `!${replacement}`
      }
      this.insertText(replacement)
    })
  }

  @action
  insertText(txt: string) {
    this.editorState = insertText(txt, this.editorState)
  }

  @action
  toggleStage() {
    if (this.stageMode === 'Editor') {
      this.stageMode = 'Viewer'
    } else {
      this.stageMode = 'Editor'
    }
  }

  delete() {
    if (confirm('???')) {
      api.documents.remove(this.auth, this).subscribe(r => {
        this.clear()
        this.loadLatest()
      })
    }
  }

  @computed
  get sortedLabels(): string[] {
    return this.labels.slice().sort()
  }

  @computed
  get selectedBlockKeys(): string[] {
    const blocks = getSelectedBlocks(this.editorState.getCurrentContent(), this.editorState.getSelection())
    return blocks.map(b => b?.getKey() || '').toArray()
  }

  @computed
  get allSaved(): boolean {
    return this.lastSavedContent === this.mdContent
  }

  @computed
  get mdContent(): string {
    const contentState = this.editorState.getCurrentContent()
    return getText(contentState)
  }

}


export default Current