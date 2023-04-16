import { observer } from 'mobx-react'
import { useContext, useEffect } from 'react'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { Button, ButtonFlex } from '../atoms/Button'
import { GlobeIcon, ListIcon, NewIcon, SaveIcon, TrashIcon } from '../atoms/Icons'
import { SpaceBetween } from '../atoms/Layout'
import { CheckableListItem, List, ListItem } from '../atoms/List'
import { Headline, Metadata, MetadataLink, Text } from '../atoms/Text'
import DocLinks from '../components/DocLinks'
import LabelList from '../components/LabelList'
import Search from '../components/search/Search'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { AuthStore, CurrentStore, LabelGraphStore, WorldMapStore } from '../store'

const Container = styled.div`
  width: 250px;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding-right: 15px;
  overflow-y: auto;
`

const BottomContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: flex-end;
`

const FixedUpperRight = styled.div`
  position: fixed;
  top: 3px;
  right: 3px;
  z-index: 99;
`

const SidenoteTitle = styled(Headline)`
  cursor: pointer;
`

const ContentMenu: React.FC = observer(() => {
  const current = useContext(CurrentStore)
  return (
    <>
      <Metadata>{current.id}</Metadata>
      <Metadata>{current.createdAt.toISOString()}</Metadata>
      <Metadata>{current.updatedAt.toISOString()}</Metadata>

      <br />
      <Text>Titel</Text>
      <span>{current.title}</span>
      <br />
      <br />

      <LabelList />

      <br />
      <br />
      <DocLinks />

    </>
  )
})

const LabelGraphMenu: React.FC = observer(() => {
  const store = useContext(LabelGraphStore)

  return (
    <>
      <br />
      <Text>{store.label}</Text>
      <br />
      <List>
        {store.contents.map(c => {
          return (
            <ListItem key={c.id}>
              <MetadataLink
                to={`/c/${c.id}`}>{c.title}</MetadataLink>
            </ListItem>
          )
        })}
      </List>
    </>
  )
})

const WorldMapMenu: React.FC = observer(() => {

  const store = useContext(WorldMapStore)

  useEffect(() => {
    store.fetchLabels()
    store.update()
  }, [])

  return (
    <>
      <br />
      <MetadataLink
        to={`/c/${store.selectedDoc.id}`}>{store.selectedDoc.title}</MetadataLink>
      <br />
      <Text>Labels</Text>
      <List>
        {store.labels.map(l => {
          return (
            <ListItem key={l}>
              <MetadataLink to={`/l/${l}`} key={l} >
                {l}
              </MetadataLink >
            </ListItem>
          )
        })}
      </  List>
    </>
  )
})


const Menu = () => {

  const current = useContext(CurrentStore)
  const auth = useContext(AuthStore)
  const nav = useNavigate()

  const newDoc = () => {
    current.clear()
    nav('/new')
  }

  return (
    <Container>
      <SidenoteTitle onClick={() => current.loadLatest()}>
        Sidenote {current.allSaved ? '' : '*'}
      </SidenoteTitle>
      <br />
      <SpaceBetween>
        <Button $noBorder onClick={newDoc} title="new document">
          <NewIcon />
        </Button>
        <Button $noBorder onClick={() => current.save()} title="new document">
          <SaveIcon />
        </Button>
        <Button $noBorder as={Link} to="/c/list" title="list all">
          <ListIcon />
        </Button>
        <Button $noBorder as={Link} to="/c/map" title="world map with all connections">
          <GlobeIcon />
        </Button>
        <Button $noBorder onClick={() => current.delete()} title="delete current document">
          <TrashIcon />
        </Button>
      </SpaceBetween>
      <br />
      <Search />
      <br />

      <Routes>
        <Route path={'/c/map'} element={<WorldMapMenu />} />
        <Route path={'/'} element={<ContentMenu />} />
        <Route path={'/new'} element={<ContentMenu />} />
        <Route path={'/c/:id'} element={<ContentMenu />} />
        <Route path={'/l/:id'} element={<LabelGraphMenu />} />
      </Routes>

      <BottomContainer>
        <ButtonFlex onClick={() => auth.logout()}>logout</ButtonFlex>
      </BottomContainer>

      <FixedUpperRight>
        <Button onClick={() => current.toggleStage()}>{current.stageMode}</Button>
      </FixedUpperRight>

    </Container>
  )
}


export default observer(Menu)