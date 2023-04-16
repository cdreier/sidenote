import { EditorState, Modifier } from 'draft-js'

import  {createSelection, getSelectedBlocks} from '../util'

const shouldWrap = (editorState: EditorState): boolean => {
  const selection = editorState.getSelection()
  return !selection.isCollapsed()
}

const wrapBlock = (editorState: EditorState, type: string): EditorState => {

  const selection = editorState.getSelection()
  const chars = type.split('')
  let contentState = editorState.getCurrentContent()

  // if this sucks too hard, we can just do nothing when more than one block is selected
  const block = getSelectedBlocks(contentState, selection).first()

  const anchor = selection.getAnchorOffset()
  const focus = selection.getFocusOffset()
  const [start, end] = anchor > focus ? [focus, anchor] : [anchor, focus]

  const startSel = createSelection(block, start, start)
  contentState = Modifier.insertText(contentState, startSel, chars[0])
  const endSel = createSelection(block, end+1, end+1)
  contentState = Modifier.insertText(contentState, endSel, chars[1])

  const newSelection = createSelection(block, start + chars[0].length, end + chars[0].length)
  const newEditorState = EditorState.push(editorState, contentState, 'insert-characters')

  return EditorState.forceSelection(newEditorState, newSelection)
}

export {
  wrapBlock,
  shouldWrap,
}