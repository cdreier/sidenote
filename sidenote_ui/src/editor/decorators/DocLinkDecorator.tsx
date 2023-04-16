import { ContentBlock, ContentState, EditorState, Modifier } from 'draft-js'
import { observer } from 'mobx-react'
import { FC, useContext, useEffect, useState } from 'react'
import { filter } from 'rxjs/operators'
import styled from 'styled-components'

import { save } from '../../api/documents'
import { ProblemIcon } from '../../atoms/Icons'
import SearchOverlay from '../../components/search/SearchOverlay'
import { CacheStore, SearchStore } from '../../store'
import { Document } from '../../store/Cache'
import Current from '../../store/Current'
import { SelectedSearchResult } from '../../store/SearchModel'
import { createSelection } from '../util'

const HANDLE_REGEX = /\[\[.*\]\]/g

function docLinkStrategy(block: ContentBlock, callback: (start: number, end: number) => void, contentState: ContentState) {
  const text = block.getText()
  let matchArr, start
  while ((matchArr = HANDLE_REGEX.exec(text)) !== null) {
    start = matchArr.index
    callback(start, start + matchArr[0].length)
  }
}

const DocLinkWrapper = styled.span`
  background-color: ${props => props.theme.palette[1]};
`

const DocLinkSearch = styled.span`
  position: relative;
  top: 20px;
`

const InvalidDocumentLinkIcon = styled.div`
  position: absolute;
`

interface DocLinkDecoratorProps {
  blockKey: string
  decoratedText: string
  children?: React.ReactNode
}

const PIPE_UUID_REGEX = /.*\|\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/g

const parseID = (txt: string) => {
  const parts = txt.split('|')
  return parts[1].slice(0, parts[1].length - 2)
}

const createNewNote = 'create new note'

const DocLinkDecorator = (current: Current): FC<DocLinkDecoratorProps> => observer(({ children, blockKey = '', decoratedText }) => {

  const cache = useContext(CacheStore)
  const sh = useContext(SearchStore)
  const [docRef, setDocRef] = useState<Document | null>(null)

  // lets use the block key from draftjs to uniqe identify the search
  const s = sh.getSearch(`docLinkSearch_${blockKey}`, createNewNote)

  // effect that subscribes to search and search results
  useEffect(() => {

    const receivedNote = (n: SelectedSearchResult) => {
      setDocRef(cache.document(n.id))

      const blockText = current.selectedBlock.getText()
      const offset = blockText.indexOf(decoratedText)

      const selection = createSelection(current.selectedBlock, offset + 2, offset + decoratedText.length - 2)
      const newContentState = Modifier.replaceText(
        current.editorState.getCurrentContent(),
        selection,
        `${n.title}|${n.id}`,
      )
      current.editorState = EditorState.push(current.editorState, newContentState, 'insert-characters')

      if (!current.links.includes(n.id)) {
        current.links.push(n.id)
      }
      s.clear()
    }

    const createNoteSub = s.selected.pipe(
      filter(n => n.id === createNewNote),
    ).subscribe(n => {
      const term = decoratedText.substring(2, decoratedText.length - 2) // strip brackets
      save(s.auth, {
        title: term,
        mdContent: `# ${term}`,
      }).subscribe(n => receivedNote({
        id: n.id,
        title: n.title,
        type: '',
      }))
    })

    const sub = s.selected.pipe(
      filter(n => n.id !== createNewNote),
    ).subscribe(receivedNote)

    return () => {
      s.clear()
      sub.unsubscribe()
      createNoteSub.unsubscribe()
    }
  }, [s, decoratedText])

  // effect that triggers the search
  useEffect(() => {
    if (!current.selectedBlockKeys.includes(blockKey)) {
      return
    }

    const blockText = current.selectedBlock.getText()
    const textOffset = blockText.indexOf(decoratedText)
    const cursorOffset = current.editorState.getSelection().getStartOffset()
    if (cursorOffset < textOffset || cursorOffset > textOffset + decoratedText.length) {
      return
    }

    const check = decoratedText.match(PIPE_UUID_REGEX) || []
    if (check.length > 0) {
      setDocRef(cache.document(parseID(decoratedText)))
      return
    }
    const term = decoratedText.substring(2, decoratedText.length - 2) // strip brackets
    if (term !== '') {
      s.term = `-type:label +${term}`
    }
  }, [decoratedText, current.selectedBlockKeys])

  useEffect(() => {
    if (decoratedText.match(PIPE_UUID_REGEX)) {
      setDocRef(cache.document(parseID(decoratedText)))
    }

    return () => {
      if (current.stageMode === 'Editor') {
        current._linkMap.delete(blockKey)
      }
    }
  }, [])

  useEffect(() => {
    if (docRef?.id && docRef?.id !== '') {
      current._linkMap.set(blockKey, docRef)
    } else {
      current._linkMap.delete(blockKey)
    }
  }, [docRef?.id])

  return (
    <>
      <DocLinkSearch>
        <SearchOverlay id={s.id} />
      </DocLinkSearch>
      <DocLinkWrapper >
        {children}
        {docRef?.id !== '' ? null : <InvalidDocumentLinkIcon ><ProblemIcon color="red" /></InvalidDocumentLinkIcon>}
      </DocLinkWrapper>
    </>
  )
})

export {
  docLinkStrategy,
  DocLinkDecorator,
}