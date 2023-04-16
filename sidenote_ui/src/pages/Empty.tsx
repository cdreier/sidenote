import { EditorState } from 'draft-js'
import { observer } from 'mobx-react'
import { FC, useContext, useEffect, useState } from 'react'
import Graph from 'react-graph-vis'
import { down } from 'styled-breakpoints'
import { useBreakpoint } from 'styled-breakpoints/react-styled'
import styled from 'styled-components'

import Keybindings from '../components/Keybindings'
import MDViewer from '../components/MDViewer'
import Editor from '../editor/Editor'
import { CurrentStore } from '../store'

const Wrapper = styled.div`
  display: flex;
  flex: 1;
  overflow: auto;
  border-left: 1px solid ${props => props.theme.highlight};
`

const Empty: FC = () => {

  const current = useContext(CurrentStore)
  const smallScreen = useBreakpoint(down('lg'))


  return (
    <Wrapper>
      {((current.stageMode === 'Viewer' && smallScreen) === false) && (
        <Editor editor={{
          getEditorState: () => current.editorState,
          setEditorState: (e: EditorState) => current.editorState = e,
        }} />
      )}
      {current.stageMode === 'Viewer' && (
        <MDViewer />
      )}
      <Keybindings current={current} enabled={true} />
    </Wrapper>
  )
}

export default observer(Empty)