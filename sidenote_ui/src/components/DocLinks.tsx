import { observer } from 'mobx-react'
import { useContext } from 'react'

import { List, ListItem } from '../atoms/List'
import { MetadataLink, Text } from '../atoms/Text'
import { CacheStore, CurrentStore } from '../store'


const DocLinks = () => {

  const current = useContext(CurrentStore)
  const cache = useContext(CacheStore)

  return (
    <div>
      <Text>Links</Text>
      <List>
        {current.links.map(l => {
          return (
            <ListItem key={l}>
              <MetadataLink to={`/c/${cache.document(l)?.id}`}>{cache.document(l)?.title}</MetadataLink>
            </ListItem>
          )
        })}
      </List>

      <br />
      <br />
      <Text>Backlinks</Text>
      <List>
        {current.backlinks.map(l => {
          return (
            <ListItem key={l} >
              <MetadataLink to={`/c/${cache.document(l)?.id}`}>{cache.document(l)?.title}</MetadataLink>
            </ListItem>
          )
        })}
      </List>
    </div>
  )
}


export default observer(DocLinks)