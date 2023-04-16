import { ContentBlock, ContentState, EditorState, Modifier } from 'draft-js'
import { FC, useContext, useEffect, useState } from 'react'
import styled from 'styled-components'

import Checkbox from '../../atoms/Checkbox'
import { CurrentStore } from '../../store'
import { createSelectionFromBlockKey } from '../util'

const HANDLE_REGEX = /(^|\s)\[x?\]\s/g

function checkboxStrategy(block: ContentBlock, callback: (start: number, end: number) => void, contentState: ContentState) {
  const text = block.getText()
  let matchArr, start
  while ((matchArr = HANDLE_REGEX.exec(text)) !== null) {
    start = matchArr.index
    callback(start, start + matchArr[0].length)
  }
}

const CheckboxWrapper = styled.span`
  div {
    position:relative;
    top: 6px;
    margin-right: 8px;
  }
`

interface DecoratorProps {
  decoratedText?: string
  children?: React.ReactNode
  blockKey: string
  start: number
  end: number
}

const CheckboxDecorator = (): FC<DecoratorProps> => ({ children, decoratedText, blockKey, start, end }) => {

  const current = useContext(CurrentStore)

  const [checked, setChecked] = useState(false)

  useEffect(() => {
    setChecked(decoratedText?.includes('[x]') || false)
  }, [decoratedText])

  const clicked = () => {
    let spaceOrStartofline = " "
    if (decoratedText?.charAt(0) === "[") {
      spaceOrStartofline = ""
    }
    let content = `${spaceOrStartofline}[] `
    if (!checked) {
      content = `${spaceOrStartofline}[x] `
    }
    const selection = createSelectionFromBlockKey(blockKey, start, end)
    const newContentState = Modifier.replaceText(
      current.editorState.getCurrentContent(),
      selection,
      content,
    )
    current.editorState = EditorState.push(current.editorState, newContentState, 'change-block-data')
  }

  return (
    <CheckboxWrapper >
      {children}
      <Checkbox readOnly checked={checked} onClick={(e) => {
        e.preventDefault()
        clicked()
      }} />
    </CheckboxWrapper>
  )
}

export {
  checkboxStrategy,
  CheckboxDecorator,
}