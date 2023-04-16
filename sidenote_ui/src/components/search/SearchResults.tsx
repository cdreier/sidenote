import { observer } from 'mobx-react'
import { FC, useContext, useEffect, useState } from 'react'
import styled from 'styled-components'

import { Hit } from '../../api/search'
import { SearchStore } from '../../store'


const Container = styled.div`
  padding: 0 3px 3px;
  max-width: 500px;
`

interface SearchResultRowProps {
  highlight: boolean
}

const SearchResultRow = styled.a<SearchResultRowProps>`
  display: flex;
  flex-direction: column;
  margin-top: 3px;
  background-color: ${props => props.highlight ? props.theme.highlight : props.theme.overlay};
  cursor: pointer;
  &:hover {
    background-color: ${props => props.theme.highlight};
  }
`

const SearchResultPreview = styled.div`
  font-size: 10px;
  background-color: ${props => props.theme.overlay};
  padding: 6px 0;
  mark {
    background-color: ${props => props.theme.palette[5]};
  }
`

interface SearchResultsProps {
  id: string
}

const SearchResults: FC<SearchResultsProps> = ({ id }) => {

  const sh = useContext(SearchStore)
  const s = sh.getSearch(id)
  const [activeIndex, setActiveIndex] = useState(0)

  const onSelected = (h: Hit) => {
    s.selected.next({
      id: h.id,
      title: h.fields?.title,
      type: h.fields?.type,
    })
  }

  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex(activeIndex - 1)
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex(activeIndex + 1)
        return
      }
      if (e.key === 'Enter') {
        e.stopPropagation()
        e.preventDefault()
        onSelected(s.result.hits[activeIndex])
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        s.clear()
        return
      }
    }

    document.addEventListener('keydown', keyHandler)

    return () => {
      document.removeEventListener('keydown', keyHandler)
    }
  }, [activeIndex])

  const getSearchResultLabel = (h: Hit) => {
    if (h.fields?.title) {
      return h.fields?.title
    }
    return `@${h.id}`
  }

  const getSearchResultPreview = (h: Hit) => {
    if (h.fragments.md) {
      return <SearchResultPreview dangerouslySetInnerHTML={{
        __html: h.fragments.md.join('<br />'),
      }} />
    }
    return null
  }

  return (
    <Container>
      {s.result.hits.map((h, i) => {
        return (
          <SearchResultRow key={h.id} highlight={i === activeIndex} onClick={() => onSelected(s.result.hits[i])}>
            <div>{getSearchResultLabel(h)}</div>
            {i === activeIndex && getSearchResultPreview(h)}
          </SearchResultRow>
        )
      })}
    </Container>
  )
}


export default observer(SearchResults)