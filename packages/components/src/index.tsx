import { Content, MessageType } from 'content-typings'
import React, { FC } from 'react'
import defaultRenderer, { Renderer } from './renderer'
import { MessageConfig } from './typings'

export interface ReactMessageRendererProps {
  content: Content<MessageType>
  config: MessageConfig
  renderer?: Renderer
}

const ReactMessageRenderer: FC<ReactMessageRendererProps> = ({ content, config, renderer = defaultRenderer }) => {
  return <>{renderer.render({ content, config })}</>
}

export default ReactMessageRenderer
