import { configure } from 'mobx'
import { observer } from 'mobx-react'
import { FC, useContext } from 'react'
import {
  BrowserRouter,
  Route,
  Router,
  Routes,
} from 'react-router-dom'
import styled, { ThemeProvider } from 'styled-components'

import { Button } from './atoms/Button'
import Feedback from './components/Feedback'
import SidenoteRouter from './components/SidenoteRouter'
import useUploader from './components/useUploader'
import AuthCallback from './pages/AuthCallback'
import ContentList from './pages/ContentList'
import Empty from './pages/Empty'
import Home from './pages/Home'
import Labels from './pages/Labels'
import Menu from './pages/Menu'
import WorldMap from './pages/WorldMap'
import { AuthStore } from './store'
import Theme from './theme'

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  padding: 15px;
  font-family: Iosevka Slab Web;
  background-color: ${props => props.theme.background};
  color: ${props => props.theme.color};
`

const Centered = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
`

configure({
  enforceActions: 'never',
})

const App: FC = () => {

  const { rootProps, overlay: uploadOverlay } = useUploader()

  const auth = useContext(AuthStore)

  const renderApp = () => {
    if (!auth.ready) {
      return (
        <Centered>
          <Button onClick={() => auth.startAuth()}>login</Button>
          <p>{SERVER_CONFIG.RootURL}</p>
        </Centered>
      )
    }

    return (
      <>
        {uploadOverlay()}
        <Menu />
        <Feedback />
        <Routes>
          <Route path={'/l/:id'} element={<Labels />} />
          <Route path={'/c/list'} element={<ContentList />} />
          <Route path={'/c/map'} element={<WorldMap />} />
          <Route path={'/new'} element={<Empty />} />
          <Route path={'/c/:id'} element={<Home />} />
          <Route path={'/'} element={<Home />} />
        </Routes>
      </>
    )
  }

  return (
    <ThemeProvider theme={Theme}>
      <Wrapper {...rootProps}>
        <SidenoteRouter >
          <Routes>
            <Route path={'/auth/redirect'} element={<AuthCallback />} />
          </Routes>
          {renderApp()}
        </SidenoteRouter>
      </Wrapper>
    </ThemeProvider>
  )
}

export default observer(App)
