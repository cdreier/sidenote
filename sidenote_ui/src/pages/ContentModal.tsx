import { EditorState } from 'draft-js'
import { useContext, useEffect, useState } from 'react'
import styled from 'styled-components'

import Keybindings from '../components/Keybindings'
import Editor from '../editor/Editor'
import { auth, FeedbackStore } from '../store'
import Current from '../store/Current'

interface ContentModalProps {
  contendID: string
  onClose: () => void
}

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: rgba(0,0,0,0.4);
  z-index: 1;
  display: flex;
  padding: 100px;
`

const Container = styled.div`
  flex: 1;
  display: flex;
  background-color: ${props => props.theme.background};
  padding: 15px;
`

const ContentModal: React.FC<ContentModalProps> = ({ contendID, onClose }) => {

  const fb = useContext(FeedbackStore)
  const [current, _] = useState(new Current(auth, fb, false))

  useEffect(() => {
    current.loadDocument(contendID)
  }, [contendID])

  if (contendID === '') {
    return null
  }

  return (
    <Backdrop id='backdrop' onClick={(e) => {
      if ((e.target as any).id === 'backdrop') {
        onClose()
      }
    }}>
      <Container>
        <Editor editor={{
          getEditorState: () => current.editorState,
          setEditorState: (e: EditorState) => current.editorState = e,
        }} />
      </Container>
      <Keybindings current={current} events={{
        'Escape': () => onClose(),
      }} />
    </Backdrop>
  )
}

export default ContentModal