import { useEffect, useState } from 'react'
import { useContext } from 'react'
import { Subject } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import styled from 'styled-components'

import { documents } from '../api'
import { Authorizer } from '../api/client'
import { SmallContent } from '../api/dto'
import { Button } from '../atoms/Button'
import { SpaceBetween } from '../atoms/Layout'
import { Table } from '../atoms/Table'
import { TextLink } from '../atoms/Text'
import { AuthStore } from '../store'

const Wrapper = styled.div`
  padding: 0 0 0 9px;
  overflow: auto;
  border-left: 1px solid ${props => props.theme.highlight};
  display: flex;
  flex-direction: column;
  width: 70%;
`

interface ListQueryOptions {
  a: Authorizer
  cursor: string
  dir: string
}

const fetcher = new Subject<ListQueryOptions>()

const ContentList: React.FC = () => {

  const a = useContext(AuthStore)
  const [list, setList] = useState<SmallContent[]>([])
  const [cursor, setCursor] = useState('')

  useEffect(() => {
    fetcher.pipe(
      switchMap((d: ListQueryOptions) => documents.list(d.a, d.cursor, 20, d.dir)),
    ).subscribe(r => {
      setList(r.data)
      setCursor(r.data[r.data.length - 1].id)
    })

    fetcher.next({
      a,
      cursor,
      dir: 'f',
    })
  }, [])

  return (
    <Wrapper>
      <Table>
        {list.map(c => {
          return (
            <tr key={c.id}>
              <td >
                <TextLink to={`/c/${c.id}`}>
                  {c.title}
                </TextLink>
              </td>
              <td >
                {c.labels?.join(',')}
              </td>
            </tr>
          )
        })}
      </Table>


      <SpaceBetween>
        <Button onClick={() => fetcher.next({
          dir: 'b',
          cursor,
          a,
        })}>
          {'<<'}
        </Button>
        <Button onClick={() => fetcher.next({
          dir: 'f',
          cursor,
          a,
        })}>
          {'>>'}
        </Button>
      </SpaceBetween>
    </Wrapper>
  )
}

export default ContentList