import { observer } from 'mobx-react'
import { useContext, useEffect, useState } from 'react'
import Graph from 'react-graph-vis'
import { useNavigate, useParams } from 'react-router'
import styled from 'styled-components'

import { graphOptions } from '../config/graph'
import { CacheStore, LabelGraphStore } from '../store'
import ContentModal from './ContentModal'

const Container = styled.div`
  width: 100%;
  height: 100%;
`

const Labels = () => {

  const { id } = useParams<'id'>()
  const store = useContext(LabelGraphStore)
  const [editorModalID, setEditorModalID] = useState('')

  useEffect(() => {
    store.update(id || '')
  }, [id])

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


export default observer(Labels)