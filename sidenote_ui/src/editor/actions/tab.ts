import { ContentBlock, EditorChangeType, EditorState, Modifier, SelectionState } from 'draft-js'
import { KeyboardEvent } from 'react'

import { createSelection, getSelectedBlocks } from '../util'

const TAB = '  '

const onTab = (e: KeyboardEvent<{}>, editorState: EditorState): EditorState => {
  
  const moveBack = e.shiftKey
  var contentState = editorState.getCurrentContent()
  var selection = editorState.getSelection()

  // console.log('TAB', selection.getFocusOffset(), selection.getAnchorOffset())

  let finalEditorState = editorState
  let tmpState = contentState
  let changeType: EditorChangeType = 'insert-characters'
  // only cursor, insert tab on current position
  if (selection.isCollapsed()) {
    
    const block = getSelectedBlocks(contentState, selection).first()
    if(moveBack) {
      // check if the beginning of the block is a tab that can be removed
      const blockTxt = block?.getText()
      if(blockTxt.slice(0, TAB.length) === TAB){
        const sel = createSelection(block, 0, TAB.length)
        tmpState = Modifier.replaceText(contentState, sel, '')
        changeType = 'remove-range'
      }
    } else {
      tmpState = Modifier.insertText(contentState, selection, TAB)
    }

    if (contentState !== tmpState){
      finalEditorState = EditorState.push(finalEditorState, tmpState, changeType)
    }
  } else {
    // multi-selection, get all blocks, move them
    const selectedBlock = getSelectedBlocks(contentState, selection)
    selectedBlock.forEach((block: ContentBlock | undefined) => {
      const blockKey = block?.getKey() as string
      if(moveBack){
        // check if the beginning of the block is a tab that can be removed
        if(block?.getText().slice(0, TAB.length) === TAB){
          const sel = createSelection(block as ContentBlock, 0, TAB.length)
          tmpState = Modifier.replaceText(finalEditorState.getCurrentContent(), sel, '')
          changeType = 'remove-range'
        }
      } else {
        const sel = SelectionState.createEmpty(blockKey)
        tmpState = Modifier.insertText(finalEditorState.getCurrentContent(), sel, TAB )
      }

      if (contentState !== tmpState){
        finalEditorState = EditorState.push(finalEditorState, tmpState, changeType)

        // var finalContentState = finalEditorState.getCurrentContent()
        // var finalSelection = finalEditorState.getSelection() 
        // finalEditorState = EditorState.acceptSelection(finalEditorState, finalSelection)
      }
    })
    
  }



  return finalEditorState

}

export {
  onTab,
}