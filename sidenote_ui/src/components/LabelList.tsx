import { observer } from 'mobx-react'
import { useContext } from 'react'

import { List, ListItem } from '../atoms/List'
import { Metadata, MetadataLink, Text, TextLink } from '../atoms/Text'
import { CurrentStore } from '../store'


const LabelList = () => {

  const current = useContext(CurrentStore)

  return (
    <div>
      <Text>Labels</Text>
      <List>
        {current.sortedLabels.map(l => {
          return (
            <ListItem key={l}>
              <MetadataLink to={`/l/${l}`}>{l}</MetadataLink>
            </ListItem>
          )
        })}
      </List>
    </div>
  )
}


export default observer(LabelList)