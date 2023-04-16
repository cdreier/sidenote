import { FC, useContext, useEffect } from 'react'

import Current from '../store/Current'

interface CustomEvent {
  [key: string]: () => void
}

interface KeybindingsProps {
  enabled?: boolean
  current: Current
  events?: CustomEvent
}

const Keybindings: FC<KeybindingsProps> = ({ enabled = true, current, events }) => {

  useEffect(() => {
    const keydown = (e: KeyboardEvent) => {

      let customKey = e.key
      if (e.ctrlKey) {
        customKey = 'Ctrl+' + e.key
      }

      if (events && events[customKey]) {
        e.preventDefault()
        const evt = events[customKey]
        if (evt) {
          evt()
        }
        return
      }
      if (e.key === 's' && e.ctrlKey && enabled) {
        e.preventDefault()
        current.save()
        return
      }
      if (e.key === 'n' && e.ctrlKey && enabled) {
        e.preventDefault()
        current.clear()
        return
      }
    }

    const onPaste = (event: ClipboardEvent) => {
      event.stopPropagation()
      event.preventDefault()
      if (!enabled) {
        return
      }

      // const pastedText = event.clipboardData?.getData('Text')
      // if (pastedText && pastedText !== '') {
      //   event.preventDefault()
      //   event.stopPropagation()
      //   // event.clipboardData?.getData('Text').replace(pastedText, 'w000t')
      //   console.log(pastedText)
      //   return
      // }


      var items = event.clipboardData?.items
      if (!items) {
        return
      }
      for (let i = 0; i < items.length; i++) {
        var item = items[i]
        if (item.kind === 'file') {
          var blob = item.getAsFile()
          var reader = new FileReader()
          reader.onload = function (event) {
            current.uploadFile(event.target?.result)
          } // data url!
          reader.readAsDataURL(blob as Blob)
        }
      }
    }

    document.addEventListener('keydown', keydown)

    document.addEventListener('paste', onPaste)

    return () => {
      document.removeEventListener('keydown', keydown)
      document.removeEventListener('paste', onPaste)
    }

  }, [enabled, current])

  return (
    <></>
  )

}

export default Keybindings