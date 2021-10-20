import { AxiosInstance } from 'axios'
import { InjectedIntl } from 'react-intl'
import { Settings as CarouselSettings } from 'react-slick'
import { messageTypes } from './utils'

declare global {
  export interface Window {
    botpress?: StudioConnector
  }
}

export type uuid = string

export type FileUploadHandler = (label: string, payload: any, file: File) => Promise<void>

export interface LiteStore {
  composer: {
    setLocked: (locked: boolean) => void
    locked: boolean
  }
}
export interface MessageConfig {
  messageId: uuid
  authorId?: uuid
  sentOn: Date
  escapeHTML: boolean
  isInEmulator: boolean
  intl: InjectedIntl
  showTimestamp: boolean
  noMessageBubble: boolean
  isLastGroup: boolean
  isLastOfGroup: boolean
  isBotMessage: boolean
  bp?: StudioConnector
  store?: LiteStore
  shouldPlay?: boolean // used for voice message only
  onSendData: (data: any) => Promise<void>
  onFileUpload: FileUploadHandler
  onMessageClicked: (messageId?: uuid) => void
  onAudioEnded?: React.EventHandler<HTMLMediaElementEventMap['ended']>
}

export interface StudioConnector {
  /** Event emitter */
  events: any
  /** An axios instance */
  axios: AxiosInstance
  getModuleInjector: any
  loadModuleView: any
}

type MessageTypeTuple = typeof messageTypes

export type MessageType = MessageTypeTuple[number]

export interface Message<T extends MessageType> {
  type: T
  payload: Payload<T>
  config: MessageConfig
}
interface FilePayload {
  url: string
  title?: string
}

export interface TextMessagePayload {
  text: string
  markdown: boolean
  trimLength?: number
}

export interface CardPayload {
  picture?: string
  title: string
  subtitle?: string
  buttons: CardButton[]
}

// TODO: Improve this typing
export interface CardButton {
  type: 'say_something' | 'open_url' | 'postback'
  title: string
  url?: string
  payload?: any
  text?: string
}
// Can be either one of these types:
// {
//   type: 'say_something'
//   title: string
//   text: string
// }
// {
//   type: 'open_url'
//   title: string
//   url: string
// }

// {
//   type: 'postback'
//   title: string
//   payload: any
// }

export interface CarouselPayload {
  // maybe text: string
  carousel: {
    elements: CardPayload[]
    settings?: CarouselSettings
  }
  style?: { [key: string]: any }
}

export interface DropdownOption {
  label: string
  value: string
}
export interface DropdownPayload {
  options: DropdownOption[]
  buttonText?: string
  escapeHTML: boolean
  allowCreation?: boolean
  placeholderText?: string
  allowMultiple?: boolean
  width?: number
  markdown: boolean
  message: string
  displayInKeyboard?: boolean
}

interface QuickReply {
  title: string
  payload: string
}
export interface QuickReplyPayload extends TextMessagePayload {
  quick_replies: QuickReply[]
  disableFreeText?: boolean
}

export interface VoiceMessagePayload {
  audio: string
  autoPlay: boolean
}

export interface CustomComponentPayload
  extends Partial<
    Pick<
      MessageConfig,
      | 'messageId'
      | 'isLastGroup'
      | 'isLastOfGroup'
      | 'isBotMessage'
      | 'onSendData'
      | 'onFileUpload'
      | 'sentOn'
      | 'store'
      | 'intl'
    >
  > {
  module: string
  component: string
  wrapped?: any
}

export type Payload<T extends MessageType> = T extends 'text'
  ? TextMessagePayload // checked OK - '
  : T extends 'file'
  ? FilePayload // checked OK
  : T extends 'audio'
  ? FilePayload // checked OK
  : T extends 'video'
  ? FilePayload // checked OK
  : T extends 'carousel'
  ? CarouselPayload // checked OK - view comment
  : T extends 'login_prompt'
  ? { username?: string } // checked OK
  : T extends 'quick_reply'
  ? QuickReplyPayload
  : T extends 'visit'
  ? {}
  : T extends 'voice'
  ? VoiceMessagePayload
  : T extends 'typing'
  ? {}
  : T extends 'dropdown'
  ? DropdownPayload
  : T extends 'custom'
  ? CustomComponentPayload
  : T extends 'unsupported'
  ? any
  : never

export type MessageTypeHandlerProps<T extends MessageType> = Omit<Message<T>, 'type'> & {
  type?: T // makes passing type prop to Components optional
}
