import { ContentBlock, ContentState, convertFromRaw, convertToRaw, EditorState, SelectionState } from 'draft-js'

import compositeDecorator from './decorators'

const getSelectedBlocks = (contentState: ContentState, selection: SelectionState): Immutable.Iterable<string, ContentBlock> => {

  var startKey = selection.getStartKey()
  var endKey = selection.getEndKey()
  var blocks = contentState.getBlockMap()

  var lastWasEnd = false
  return blocks
    .skipUntil((block: any) => block.getKey() === startKey)
    .takeUntil((block: any) => {
      var result = lastWasEnd

      if (block.getKey() === endKey) {
        lastWasEnd = true
      }

      return result
    })
}

const createSelection = (block: ContentBlock, from: number, to: number): SelectionState => {
  const sel = SelectionState.createEmpty(block.getKey())
  return sel.merge({
    anchorOffset: from,
    focusOffset: to,
  })
}

const createSelectionFromBlockKey = (blockKey: string, from: number, to: number): SelectionState => {
  const sel = SelectionState.createEmpty(blockKey)
  return sel.merge({
    anchorOffset: from,
    focusOffset: to,
  })
}

const getText = (contentState: ContentState): string => {
  return contentState.getBlocksAsArray().map(b => b.getText()).join('\n')
}

const moveSelectionToEnd = (editorState: EditorState): EditorState => {
  const content = editorState.getCurrentContent()
  const blockMap = content.getBlockMap()

  const key = blockMap.last().getKey()
  const length = blockMap.last().getLength()

  const selection = new SelectionState({
    anchorKey: key,
    anchorOffset: length,
    focusKey: key,
    focusOffset: length,
  })
  return EditorState.forceSelection(editorState, selection)
}


const replaceContentMaintainSelection = (editorState: EditorState, contentState: ContentState, decorators: any): EditorState => {
  const prevC = editorState.getSelection()
  const blocks = editorState.getCurrentContent().getBlocksAsArray()
  const focusIndex = blocks.findIndex((b) => b.getKey() === prevC.getFocusKey())

  const newBlocks = contentState.getBlocksAsArray()

  let sel = SelectionState.createEmpty('')

  if (newBlocks.length >= focusIndex) {
    const targetBlock = newBlocks[focusIndex]
    sel = createSelection(targetBlock, prevC.getFocusOffset(), prevC.getFocusOffset())
  }

  return EditorState.forceSelection(
    EditorState.createWithContent(contentState, decorators),
    sel,
  )
}

export {
  getSelectedBlocks,
  createSelection,
  createSelectionFromBlockKey,
  getText,
  moveSelectionToEnd,
  replaceContentMaintainSelection,
}