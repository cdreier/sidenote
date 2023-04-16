import { ContentBlock, ContentState } from 'draft-js'
import { FC, useContext } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { openURL } from '../../api/assets'
import { ExternalLink } from '../../atoms/Icons'
import { AuthStore } from '../../store'

const HANDLE_REGEX = /\[.*\]\([-a-zA-Z0-9@:%_\+.~#?&//=()]+\)/g

function linkStrategy(block: ContentBlock, callback: (start: number, end: number) => void, contentState: ContentState) {
  const text = block.getText()
  let matchArr, start
  while ((matchArr = HANDLE_REGEX.exec(text)) !== null) {
    start = matchArr.index
    callback(start, start + matchArr[0].length)
  }
}

const LinkWrapper = styled.span`
  background-color: ${props => props.theme.palette[0]};
  color: ${props => props.theme.palette[5]};
`

interface InlineImageDecoratorProps {
  blockKey: string
  decoratedText: string
  children?: React.ReactNode
}

const UrlLink = styled.div`
  cursor: pointer;
  display: inline;
`

const LinkDecorator = (): FC<InlineImageDecoratorProps> => ({ children, decoratedText }) => {

  const auth = useContext(AuthStore)

  const click = () => {
    const url = urlFromLine(decoratedText)
    openURL(auth, url).subscribe(res => {
      window.open(res.url)
    })
  }

  return (
    <LinkWrapper >
      {children}
      <UrlLink onClick={() => click()}>
        <ExternalLink size={24} />
      </UrlLink>
    </LinkWrapper>
  )
}

export {
  linkStrategy,
  LinkDecorator,
}


const urlFromLine = (str: string): string => {
  const [_, id] = str.split('](')
  return id.slice(0, id.length - 1)
}