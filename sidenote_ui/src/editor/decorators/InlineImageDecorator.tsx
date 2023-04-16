import { ContentBlock, ContentState } from 'draft-js'
import { FC, forwardRef, useContext, useEffect, useRef, useState } from 'react'
import CanvasDraw from 'react-canvas-draw'
import { HexColorPicker } from 'react-colorful'
import styled from 'styled-components'

import { openURL, saveCanvasOnAsset } from '../../api/assets'
import { Button } from '../../atoms/Button'
import { CloseIcon, EditIcon, SaveIcon, UndoIcon } from '../../atoms/Icons'
import AuthorizedImage from '../../atoms/Image'
import { AuthStore, FeedbackStore } from '../../store'

const HANDLE_REGEX = /!\[.*\]\([A-Za-z0-9-:/.]+\)/g

function inlineImageStrategy(block: ContentBlock, callback: (start: number, end: number) => void, contentState: ContentState) {
  const text = block.getText()
  let matchArr, start
  while ((matchArr = HANDLE_REGEX.exec(text)) !== null) {
    start = matchArr.index
    callback(start, start + matchArr[0].length)
  }
}

const InlineImageWrapper = styled.span`
  background-color: ${props => props.theme.palette[0]};
`

interface InlineImageDecoratorProps {
  blockKey: string
  decoratedText: string
  children?: React.ReactNode
}

interface ImageSize {
  maxWidth?: number
  maxHeight?: number
}

type ImageMode = 'image' | 'canvas'

const InlineImageDecorator = (): FC<InlineImageDecoratorProps> => ({ children, decoratedText }) => {

  const feedback = useContext(FeedbackStore)
  const [imageURL, setImageURL] = useState('')
  const [canvasImageURL, setCanvasImageURL] = useState('')
  const [color, setColor] = useState('#333')
  const auth = useContext(AuthStore)
  const [imageMode, setImageMode] = useState<ImageMode>('image')
  const [inlineStyle, setInlineStyle] = useState<ImageSize>({
    maxWidth: 400,
  })
  const [imgSize, setImageSize] = useState<{ w: number, h: number }>({
    w: 0,
    h: 0,
  })
  const imgRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<any>(null)

  useEffect(() => {
    const url = urlFromLine(decoratedText)
    setImageURL(url)
  }, [decoratedText])

  useEffect(() => {
    if (imageMode === 'canvas') {
      openURL(auth, imageURL).subscribe(res => {
        setCanvasImageURL(res.url)
      })
    }
  }, [imageMode])


  const saveCanvas = () => {
    saveCanvasOnAsset(auth, imageURL, canvasRef.current.getDataURL()).subscribe(res => {
      feedback.addMessage('saved')
    })
  }

  return (
    <InlineImageWrapper >
      {children}
      <br />
      {imageMode === 'image' && (
        <div>
          <AuthorizedImage src={imageURL}
            ref={imgRef}
            style={inlineStyle}
            onLoad={(img) => {
              const t = img.target as any
              setImageSize({
                w: t.naturalWidth || 0,
                h: t.naturalHeight || 0,
              })

              // check orientation and set sizes for better visibility
              if ((imgRef.current?.clientWidth || 0) > (imgRef.current?.clientHeight || 0)) {
                setInlineStyle({
                  maxHeight: 300,
                })
              }

            }} />
          <Button $noBorder onClick={() => setImageMode('canvas')}>
            <EditIcon />
          </Button>
        </div>
      )}
      {imageMode === 'canvas' && (
        <div>
          <CanvasDraw
            ref={canvasRef}
            brushRadius={5}
            imgSrc={canvasImageURL}
            brushColor={color}
            enablePanAndZoom
            canvasWidth={imgSize.w}
            canvasHeight={imgSize.h}
          />
          <Button $noBorder onClick={() => saveCanvas()}><SaveIcon size={24} /></Button>
          <Button $noBorder onClick={() => canvasRef.current.undo()}><UndoIcon size={24} /></Button>
          <Button $noBorder onClick={() => setImageMode('image')}><CloseIcon size={24} /></Button>
          <HexColorPicker color={color} onChange={setColor} />
        </div>
      )}
    </InlineImageWrapper>
  )
}

export {
  inlineImageStrategy,
  InlineImageDecorator,
}


const urlFromLine = (str: string): string => {
  const [_, id] = str.split('](')
  return id.slice(0, id.length - 1)
}