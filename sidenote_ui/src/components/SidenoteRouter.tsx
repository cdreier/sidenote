import { FC, useLayoutEffect, useState } from 'react'
import { Router } from 'react-router-dom'

import { sidenoteHistory } from '../store'

interface HistoryState {
  action: any;
  location: any;
}


const SidenoteRouter: FC<{ children?: React.ReactNode }> = ({ children }) => {
  let [state, setState] = useState<HistoryState>({
    action: sidenoteHistory.action,
    location: sidenoteHistory.location,
  })

  useLayoutEffect(() => sidenoteHistory.listen(setState), [history])

  return (
    <Router
      basename={'/'}
      location={state.location}
      navigationType={state.action}
      navigator={sidenoteHistory}
    >
      {children}
    </Router>
  )
}

export default SidenoteRouter