import { MessageType } from 'content-typings'
import React, { ReactElement } from 'react'
import { MessageTypeHandlerProps, Message } from 'typings'
import { Carousel, Card } from './Carousel'
import { Custom } from './Custom'
import { Dropdown } from './Dropdown'
import { Video, Audio, Image, File } from './FileMessage'
import { LoginPrompt } from './LoginPrompt'
import { QuickReplies } from './QuickReplies'
import { Text } from './Text'
import { TypingIndicator } from './TypingIndicator'
import { VoiceMessage } from './VoiceMessage'

export const defaultTypesRenderers = {
  text: Text,
  quick_reply: QuickReplies,
  login_prompt: LoginPrompt,
  carousel: Carousel,
  card: Card,
  // Currently unsupported
  // location: () => null,
  file: File,
  video: Video,
  audio: Audio,
  image: Image,
  dropdown: Dropdown,
  voice: VoiceMessage,
  visit: () => null,
  typing: TypingIndicator,
  session_reset: () => null,
  custom: Custom
}

export type MessageTypeHandler<T extends MessageType> =
  | React.ComponentType<MessageTypeHandlerProps<T>>
  | React.FC<MessageTypeHandlerProps<T>>

export class Renderer {
  private handlers: Partial<Record<MessageType, MessageTypeHandler<MessageType>>> = {}

  constructor() {
    this.set('unsupported', ({ type }) => <div>Unsupported message type: {type}</div>)
  }

  public set<T extends MessageType>(type: T, handler: MessageTypeHandler<T>) {
    this.handlers[type as MessageType] = handler as MessageTypeHandler<MessageType>
  }

  public register(handlers: Partial<{ [key in MessageType]: MessageTypeHandler<key> }>) {
    for (const type in handlers) {
      this.set(type as MessageType, handlers[type])
    }
  }

  public get<T extends MessageType>(type: T): MessageTypeHandler<T> {
    const handler = this.handlers[type] || null
    if (!handler) {
      return this.get('unsupported') as MessageTypeHandler<T>
    }
    return handler as MessageTypeHandler<T>
  }

  public has(type: MessageType): boolean {
    return !!this.handlers[type]
  }

  public render(message: Message<MessageType>): ReactElement<Message<MessageType>> {
    const Handler = this.get(message.content.type)
    return <Handler {...message.content} config={message.config} />
  }

  public registerFallbackHandler(handler: MessageTypeHandler<MessageType>) {
    this.set('unsupported', handler)
  }
}

const defaultRenderer = new Renderer()

defaultRenderer.register(defaultTypesRenderers)

// TODO: This is for backwards compatibility. Remove in the future
defaultRenderer.set('custom', ({ module, component, config, payload }) => {
  if (module === 'extensions' && component === 'Dropdown') {
    return <Dropdown {...payload} config={config} />
  }
  return <Custom module={module} component={component} config={config} />
})

export {
  defaultRenderer as default,
  Carousel,
  Card,
  Image,
  File,
  Video,
  Audio,
  Text,
  QuickReplies,
  LoginPrompt,
  Dropdown,
  VoiceMessage,
  TypingIndicator,
  Custom
}
