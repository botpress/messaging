import React, { ReactElement } from 'react'
import ReactDOM from 'react-dom'
import {
  Carousel,
  File,
  LoginPrompt,
  QuickReplies,
  Text,
  VoiceMessage,
  Custom,
  TypingIndicator,
  Dropdown
} from './renderer'
import { Message, MessageConfig, MessageType, MessageTypeHandlerProps, Payload } from './typings'
import { FallthroughIntl } from './utils'

export const defaultMessageConfig: MessageConfig = {
  escapeHTML: true,
  isInEmulator: false,
  onSendData: async () => {
    return
  },
  onFileUpload: async (label, payload, file) => {
    return
  },
  onMessageClicked: (messageId) => {
    return
  },
  isLastGroup: true,
  isLastOfGroup: true,
  isBotMessage: true,
  noMessageBubble: false,
  intl: new FallthroughIntl(),
  showTimestamp: false,
  bp: window.botpress,
  messageId: `${(Math.random() * 1000000).toFixed(0)}`,
  sentOn: new Date(Date.now())
}

export function renderMessage<T extends MessageType>(
  message: Message<T>,
  renderer: Renderer = defaultRenderer
): ReactElement {
  return renderer.render(message)
}

type MessageTypeHandler<T extends MessageType> =
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
    const Handler = this.get(message.type)
    return <Handler {...message} />
  }

  public registerFallbackHandler(handler: MessageTypeHandler<MessageType>) {
    this.set('unsupported', handler)
  }
}

export const defaultTypesRenderers = {
  text: Text,
  quick_reply: QuickReplies,
  login_prompt: LoginPrompt,
  carousel: Carousel,
  file: File,
  video: File,
  audio: File,
  image: File,
  dropdown: Dropdown,
  voice: VoiceMessage,
  visit: () => null,
  typing: TypingIndicator,
  session_reset: () => null,
  custom: Custom
}

const defaultRenderer = new Renderer()

defaultRenderer.register(defaultTypesRenderers)

// TODO: This is for backwards compatibility. Remove in the future
defaultRenderer.set('custom', ({ payload, config }) => {
  if (payload.module === 'extensions' && payload.component === 'Dropdown') {
    return <Dropdown payload={payload as any} config={config} />
  }
  return <Custom payload={payload} config={config} />
})

export default defaultRenderer
