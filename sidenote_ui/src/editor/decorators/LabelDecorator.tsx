import { ContentBlock, ContentState } from 'draft-js'
import React, { FC, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import Current from '../../store/Current'

const HANDLE_REGEX = /\B@[A-Za-z0-9-]+\b/g

function labelStrategy(block: ContentBlock, callback: (start: number, end: number) => void, contentState: ContentState) {
  const text = block.getText()
  let matchArr, start
  while ((matchArr = HANDLE_REGEX.exec(text)) !== null) {
    start = matchArr.index
    callback(start, start + matchArr[0].length)
  }
}

const LabelWrapper = styled.span`
  background-color: ${props => props.theme.palette[2]};
`

const LabelDecorator = (current: Current): FC<{ children?: React.ReactNode }> => ({ children }) => {

  const ref = useRef<HTMLSpanElement>(null)
  const [refID, setRefID] = useState('')

  useEffect(() => {
    if (ref.current !== null) {
      const idspan = ref.current.querySelector('span[data-offset-key]')
      setRefID(`${idspan?.getAttribute('data-offset-key')}`)
    }
  }, [ref])

  useEffect(() => {
    if (refID !== '') {
      current.setLabel(refID, `${ref.current?.textContent}`)
    }

    return () => {
      if (current.stageMode === 'Editor') {
        current.setLabel(refID, '')
      }
    }
  }, [children, refID])

  return (
    <LabelWrapper ref={ref}>
      {children}
    </LabelWrapper>
  )
}

export {
  labelStrategy,
  LabelDecorator,
}