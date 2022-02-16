import React, { FC } from 'react'
import { Content, MessageType } from './content-typings'
import defaultRenderer, { Renderer } from './renderer'
import { Keyboard } from './renderer/keyboard'
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

export { defaultRenderer, defaultMessageConfig, Content, MessageType, MessageConfig, Renderer, Keyboard }
