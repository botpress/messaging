import { MessageType } from 'content-typings'
import React, { FC } from 'react'
import defaultRenderer, { Renderer } from 'renderer'

import { Message } from './typings'

interface ReactMessageRendererProps {
  message: Message<MessageType>
  renderer?: Renderer
}

const ReactMessageRenderer: FC<ReactMessageRendererProps> = ({ message, renderer = defaultRenderer }) => {
  return <>{renderer.render(message)}</>
}

export default ReactMessageRenderer
