import { ContentBlock, ContentState, EditorState, Modifier } from 'draft-js'
import { FC, useContext } from 'react'
import styled from 'styled-components'

import { assets } from '../../api'
import { Button } from '../../atoms/Button'
import { ImageIcon } from '../../atoms/Icons'
import { AuthStore, CurrentStore, FeedbackStore } from '../../store'
import { createSelectionFromBlockKey } from '../util'

const HANDLE_REGEX = /!\[\]\(\)/g

function newImageStrategy(block: ContentBlock, callback: (start: number, end: number) => void, contentState: ContentState) {
  const text = block.getText()
  let matchArr, start
  while ((matchArr = HANDLE_REGEX.exec(text)) !== null) {
    start = matchArr.index
    callback(start, start + matchArr[0].length)
  }
}

const NewImageWrapper = styled.span`
  ${Button} {
    position: relative;
    top: 10px;
  }
`

interface DecoratorProps {
  decoratedText?: string
  blockKey: string
  start: number
  end: number
  children?: React.ReactNode
}

const NewImageDecorator = (): FC<DecoratorProps> => ({ children, blockKey, start, end }) => {

  const auth = useContext(AuthStore)
  const current = useContext(CurrentStore)
  const feedback = useContext(FeedbackStore)

  const createImage = () => {
    assets.createCanvasAsset(auth, current.id).subscribe(e => {
      const selection = createSelectionFromBlockKey(blockKey, start, end)
      const newContentState = Modifier.replaceText(
        current.editorState.getCurrentContent(),
        selection,
        `![your new image](${SERVER_CONFIG.RootURL}/api/content/${current.id}/files/${e.id})`,
      )
      current.editorState = EditorState.push(current.editorState, newContentState, 'change-block-data')
      feedback.addMessage('image created')
    })
  }

  return (
    <NewImageWrapper >
      {children} asd
      <Button $noBorder onClick={() => createImage()}>
        <ImageIcon />
      </Button>
    </NewImageWrapper>
  )
}

export {
  newImageStrategy,
  NewImageDecorator,
}