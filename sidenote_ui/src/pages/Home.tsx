import { EditorState } from 'draft-js'
import { observer } from 'mobx-react'
import { FC, useContext, useEffect, useState } from 'react'
import Graph from 'react-graph-vis'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

import Keybindings from '../components/Keybindings'
import MDViewer from '../components/MDViewer'
import { graphOptions } from '../config/graph'
import Editor from '../editor/Editor'
import { CurrentStore } from '../store'
import ContentModal from './ContentModal'

const Wrapper = styled.div`
  display: flex;
  flex: 1;
  overflow: auto;
  border-left: 1px solid ${props => props.theme.highlight};
`

const GraphContainer = styled.div`
  z-index: 99999;
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: rgba(0,0,0, 0.8);
  width: 300px;
  height: 300px;
  border: 1px solid ${props => props.theme.highlight};
`

const Home: FC = () => {

  const current = useContext(CurrentStore)
  const { id } = useParams<'id'>()

  const [editorModalID, setEditorModalID] = useState('')

  useEffect(() => {
    if (id && id !== '') {
      current.loadDocument(id)
    } else {
      current.loadLatest()
    }
  }, [id])

  const events = {
    select: function (event: any) {
      var { nodes } = event
      if (nodes.length > 0) {
        if (id !== nodes[0]) {
          setEditorModalID(nodes[0])
        }
      }
    },
  }

  return (
    <Wrapper>
      {current.stageMode !== 'Viewer' && (
        <Editor editor={{
          getEditorState: () => current.editorState,
          setEditorState: (e: EditorState) => current.editorState = e,
        }} />
      )}
      {current.stageMode === 'Viewer' && (
        <MDViewer />
      )}
      {(current.graph !== null && current.graph.nodes.length > 1) && (
        <GraphContainer>
          <Graph
            graph={current.graph}
            options={graphOptions}
            events={events}
          />
        </GraphContainer>
      )}
      <Keybindings current={current} enabled={editorModalID === ''} />
      <ContentModal contendID={editorModalID} onClose={() => setEditorModalID('')} />
    </Wrapper>
  )
}

export default observer(Home)