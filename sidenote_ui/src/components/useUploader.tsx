import { useCallback, useContext } from 'react'
import { useDropzone } from 'react-dropzone'
import { of, Subject } from 'rxjs'
import { concatMap, delay, switchMap } from 'rxjs/operators'
import styled from 'styled-components'

import { CurrentStore } from '../store'

interface UploadOverlayProps {
  active: boolean
}

const UploadOverlay = styled.div<UploadOverlayProps>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: ${props => props.active ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  background-color: rgba(255,255,255,0.3);
`

const useUploader = () => {

  const current = useContext(CurrentStore)

  const readFile = (f: File): Subject<any> => {
    const sub = new Subject()
    var reader = new FileReader()
    console.log(f.type)
    reader.onload = function (event) {
      if (f.type.includes('text/markdown')) {
        const splitted = event.target?.result?.toString().split(',') || []
        if (splitted.length > 0) {
          sub.next(Buffer.from(splitted[1], 'base64').toString())
        }
      } else {
        sub.next(event.target?.result)
      }
    }
    reader.readAsDataURL(f)

    return sub
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 1) {
      const f = acceptedFiles[0]
      if (f.type.includes('text/markdown')) {
        readFile(f).subscribe(data => current.importMD(data))
      } else {
        readFile(f).subscribe(blob => current.uploadFile(blob))
      }
    } else {
      // only support bulk import of md
      const mdFiles = acceptedFiles.filter(f => f.type.includes('text/markdown'))
      of(...mdFiles).pipe(
        concatMap(x => of(x).pipe(delay(1000))),
        switchMap(f => readFile(f)),
      ).subscribe(f => {
        current.importMD(f)
        // FIXME: need a better solution for this
        // the editor needs a bit time to check and set all attributes
        setTimeout(() => {
          current.save()
        }, 500)
      })
    }
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  })

  return {
    rootProps: getRootProps(),
    overlay: () => {
      return (
        <>
          <input {...getInputProps()} />
          <UploadOverlay active={isDragActive}>
            {
              isDragActive ?
                <p>Drop the files here ...</p> :
                <p>Drag n drop some files here, or click to select files</p>
            }
          </UploadOverlay>
        </>
      )
    },
  }
}

export default useUploader