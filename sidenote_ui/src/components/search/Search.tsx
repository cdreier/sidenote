import { observer } from 'mobx-react'
import { useContext, useEffect } from 'react'
import styled from 'styled-components'

import { SearchStore, sidenoteHistory } from '../../store'
import SearchOverlay from './SearchOverlay'


const SearchInput = styled.input`
  width: 95%;
`

const Container = styled.div`
  position: relative;
`

const Search = () => {

  const sh = useContext(SearchStore)
  const s = sh.getSearch('searchbar')

  // const totalHits = s.result.total_hits || 0

  useEffect(() => {
    const sub = s.selected.subscribe(n => {
      s.clear()
      if (n.type === 'label') {
        sidenoteHistory.push(`/l/${n.id}`)
      } else {
        sidenoteHistory.push(`/c/${n.id}`)
      }
    })

    return () => {
      sub.unsubscribe()
    }
  }, [])


  return (
    <Container>
      <SearchInput onChange={e => s.term = e.target.value} value={s.term} placeholder='Search' />
      <SearchOverlay id={s.id} />
    </Container>
  )
}


export default observer(Search)