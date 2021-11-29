import React, { FC } from 'react'
import { Content, MessageType } from './content-typings'
import defaultRenderer, { Renderer } from './renderer'
import { MessageConfig } from './typings'
import { defaultMessageConfig } from './utils'

export interface ReactMessageRendererProps {
  content: Content<MessageType>
  config: MessageConfig
  renderer?: Renderer
}

const ReactMessageRenderer: FC<ReactMessageRendererProps> = ({ content, config, renderer = defaultRenderer }) => {
  return <>{renderer.render({ content, config })}</>
}

export default ReactMessageRenderer
export { defaultMessageConfig, Content, MessageType, MessageConfig, Renderer }
