import { observer } from 'mobx-react'
import { useEffect, useState } from 'react'
import { useContext } from 'react'
import Graph from 'react-graph-vis'
import styled from 'styled-components'

import { graphOptions } from '../config/graph'
import { WorldMapStore } from '../store'
import ContentModal from './ContentModal'


const Container = styled.div`
  width: 100%;
  height: 100%;
`

const WorldMap = () => {

  const store = useContext(WorldMapStore)
  const [editorModalID, setEditorModalID] = useState('')

  if (store.graph === null) {
    return <p>loading</p>
  }
  const events = {
    click: (event: any) => {
      var { nodes } = event
      if (nodes.length > 0) {
        setEditorModalID(nodes[0])
      }
    },
    select: function (event: any) {
      var { nodes } = event
      if (nodes.length > 0) {
        store.selectNode(nodes[0])
      } else {
        store.selectNode('')
      }
    },
  }

  return (
    <Container>
      <Graph
        graph={store.graph}
        options={graphOptions}
        events={events}
      />
      <ContentModal contendID={editorModalID} onClose={() => setEditorModalID('')} />
    </Container>
  )
}

export default observer(WorldMap)