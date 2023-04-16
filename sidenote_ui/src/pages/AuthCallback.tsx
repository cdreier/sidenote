import { useContext, useEffect } from 'react'

import { AuthStore } from '../store'


const AuthCallback = () => {

  const auth = useContext(AuthStore)

  useEffect(() => {
    auth.callback()
  }, [])

  return <>nais</>
}


export default AuthCallback