import { EditorState, Modifier, RichUtils } from 'draft-js'

import { createSelection, getSelectedBlocks } from '../util'


export const insertText = (txt: string, editorState: EditorState): EditorState => {

  const block = getSelectedBlocks(editorState.getCurrentContent(), editorState.getSelection()).first()
  const selection = createSelection(block, 0, 0)

  const newContentState = Modifier.replaceText(
    editorState.getCurrentContent(),
    selection,
    txt,
  )
  const tmpState = EditorState.push(editorState, newContentState, 'insert-characters')
  return RichUtils.insertSoftNewline(tmpState)
}