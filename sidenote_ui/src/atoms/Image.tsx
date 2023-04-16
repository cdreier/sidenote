import { forwardRef, useContext, useEffect, useState } from 'react'

import { assets } from '../api'
import { AuthStore } from '../store'


interface ImageProps extends React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {

}

const AuthorizedImage = forwardRef<HTMLImageElement, ImageProps>((props, ref) => {

  const [src, setSrc] = useState('')
  const auth = useContext(AuthStore)

  useEffect(() => {
    if (!props.src) {
      return
    }

    if (!props.src?.startsWith(SERVER_CONFIG.RootURL)) {
      setSrc(props.src)
      return
    }

    assets.fetchAssets(auth, props.src || '').subscribe(blob => {
      if (blob) {
        setSrc(window.URL.createObjectURL(blob))
      }
    })
  }, [props.src])

  return (
    <img {...props} ref={ref} src={src} />
  )
})


export default AuthorizedImage