import 'draft-js/dist/Draft.css'

import { DraftHandleValue, Editor as DraftEditor, EditorState, getDefaultKeyBinding, KeyBindingUtil } from 'draft-js'
import { observer } from 'mobx-react'
import { FC, KeyboardEvent, useContext } from 'react'
import styled from 'styled-components'

import { SearchStore } from '../store'
import { insertText } from './actions/insert'
import { onTab } from './actions/tab'
import { shouldWrap, wrapBlock } from './actions/wrap'

const EditorWrapper = styled.div`
  flex: 1;
  padding-left: 5px;

  .DraftEditor-root{
    width: 100%;
    height: 100%;
    overflow: auto;
  }
`
type SyntheticKeyboardEvent = KeyboardEvent<{}>;

interface EditorProps {
  editor: Editor
}

interface Editor {
  getEditorState(): EditorState
  setEditorState(e: EditorState): void
}

const Editor: FC<EditorProps> = ({ editor }) => {

  const sh = useContext(SearchStore)

  const updateEditorState = (e: EditorState): boolean => {
    if (e === editor.getEditorState()) {
      console.log('updateEditorState: no update')
      return false
    }
    editor.setEditorState(e)
    return true
  }

  const keyBindingHandler = (e: SyntheticKeyboardEvent): string | null => {

    // console.log(e.code, e.key)

    // TODO: delete line: ctrl-d

    // special cases
    if (sh.searchOpen && e.key === 'Enter') {
      return null
    }

    switch (e.key) {
      case 'Tab':
        e.preventDefault()
        updateEditorState(onTab(e, editor.getEditorState()))
        return null
      case '(':
        return 'sidenote-wrap-()'
      case '[':
        return 'sidenote-wrap-[]'
      case '`':
        if (shouldWrap(editor.getEditorState())) {
          return 'sidenote-wrap-backticks'
        }
        break
      case '"':
        if (shouldWrap(editor.getEditorState())) {
          return 'sidenote-wrap-dquotes'
        }
        break
      case '\'':
        if (shouldWrap(editor.getEditorState())) {
          return 'sidenote-wrap-quotes'
        }
        break
    }

    return getDefaultKeyBinding(e)
  }

  const keyCommandHandler = (command: string): DraftHandleValue => {

    switch (command) {
      case 'sidenote-wrap-()':
        if (updateEditorState(wrapBlock(editor.getEditorState(), '()'))) {
          return 'handled'
        }
        break
      case 'sidenote-wrap-[]':
        if (updateEditorState(wrapBlock(editor.getEditorState(), '[]'))) {
          return 'handled'
        }
        break
      case 'sidenote-wrap-backticks':
        if (updateEditorState(wrapBlock(editor.getEditorState(), '``'))) {
          return 'handled'
        }
        break
      case 'sidenote-wrap-dquotes':
        if (updateEditorState(wrapBlock(editor.getEditorState(), '""'))) {
          return 'handled'
        }
        break
      case 'sidenote-wrap-quotes':
        if (updateEditorState(wrapBlock(editor.getEditorState(), '\'\''))) {
          return 'handled'
        }
        break
    }

    return 'not-handled'
  }

  const pasteHandler = (text: string, html?: string): DraftHandleValue => {

    try {
      const url = new URL(text)
      if (url.host === '' || url.hostname === '' || url.origin === '') {
        return 'not-handled'
      }
      updateEditorState(insertText(`[your link](${url})`, editor.getEditorState()))
      return 'handled'
    } catch (_) {
      return 'not-handled'
    }
  }

  return (
    <EditorWrapper>
      <DraftEditor
        keyBindingFn={keyBindingHandler}
        handleKeyCommand={keyCommandHandler}
        editorState={editor.getEditorState()}
        handlePastedText={pasteHandler}
        spellCheck={false}
        onChange={updateEditorState} />
    </EditorWrapper>
  )
}

export default observer(Editor)