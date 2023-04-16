import { observer } from 'mobx-react'
import { useContext } from 'react'
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'
import styled from 'styled-components'

import AuthorizedImage from '../atoms/Image'
import { CurrentStore } from '../store'

const ViewerContainer = styled.div`
  flex: 1;
  padding-left: 5px;
  a {
    color: white;
  }
`


const MDViewer: React.FC = () => {

  const current = useContext(CurrentStore)

  return (
    <ViewerContainer
      as={ReactMarkdown}
      remarkPlugins={[gfm]}
      components={{
        img: AuthorizedImage as any,
      }} >
      {current.mdContent}
    </ViewerContainer >
  )
}


export default observer(MDViewer)