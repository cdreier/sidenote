import { observer } from 'mobx-react'
import { useContext } from 'react'
import styled from 'styled-components'

import { FeedbackStore } from '../store'

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  z-index: 99;
  padding: 10px;
`

const ErrorMessage = styled.div`
  background-color: red;
  margin-bottom: 10px;
  padding: 10px;
  color: white;
`

const Message = styled.div`
  background-color: green;
  margin-bottom: 10px;
  padding: 10px;
  color: white;
`

const Feedback = () => {

  const msgs = useContext(FeedbackStore)


  return (
    <Wrapper>
      {msgs.errors.map(e => {
        return (
          <ErrorMessage key={e}>
            {e}
          </ErrorMessage>
        )
      })}
      {msgs.messages.map(e => {
        return (
          <Message key={e}>
            {e}
          </Message>
        )
      })}
    </Wrapper>
  )
}


export default observer(Feedback)