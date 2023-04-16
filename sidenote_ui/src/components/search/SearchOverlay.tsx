import { observer } from 'mobx-react'
import { FC, useContext, useEffect } from 'react'
import styled from 'styled-components'

import { SearchStore } from '../../store'
import SearchResults from './SearchResults'

interface ContainerProps {
}

const Container = styled.div<ContainerProps>`
  position: absolute;
  left: -5px;
  min-width: 300px;
  min-height: 30px;
  background-color: ${props => props.theme.overlay};
  border: 1px solid ${props => props.theme.overlay};
  border-radius: 2px;
  z-index: 2;
`

interface SearchOverlayProps {
  id: string
}

const SearchOverlay: FC<SearchOverlayProps> = ({ id }) => {

  const sh = useContext(SearchStore)
  const s = sh.getSearch(id)

  if (!s?.result?.total_hits || s?.result?.total_hits === 0) {
    return null
  }

  return (
    <Container key={id} >
      <SearchResults id={id} />
    </Container>
  )
}


export default observer(SearchOverlay)