import { ContentBlock, ContentState } from 'draft-js'
import { FC, useEffect } from 'react'
import styled from 'styled-components'

import Current from '../../store/Current'

const HANDLE_REGEX = /^# .*/g

function titleStrategy(block: ContentBlock, callback: (start: number, end: number) => void, contentState: ContentState) {
  const text = block.getText()
  let matchArr, start
  while ((matchArr = HANDLE_REGEX.exec(text)) !== null) {
    start = matchArr.index
    callback(start, start + matchArr[0].length)
  }
}

const TitleWrapper = styled.span`
  font-size: 21px;
`

interface TitleDecoratorProps {
  decoratedText?: string
  children?: React.ReactNode
}

const TitleDecorator = (current: Current): FC<TitleDecoratorProps> => ({ children, decoratedText }) => {

  useEffect(() => {
    current.setTitle(`${decoratedText}`)

    return () => {
      if (current.stageMode === 'Editor') {
        current.title = ''
      }
    }
  }, [decoratedText])

  return (
    <TitleWrapper >
      {children}
    </TitleWrapper>
  )
}

export {
  titleStrategy,
  TitleDecorator,
}