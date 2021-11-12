import { AxiosInstance } from 'axios'
import { Content, MessageType } from 'content-typings'
import { InjectedIntl } from 'react-intl'

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
  onAudioEnded?: (this: HTMLMediaElement, ev: HTMLMediaElementEventMap['ended']) => void
}

export interface StudioConnector {
  events: any
  axios: AxiosInstance
  getModuleInjector: any
  loadModuleView: any
}

export interface Message<T extends MessageType> {
  content: Content<T>
  config: MessageConfig
}

export type MessageTypeHandlerProps<T extends MessageType> = Omit<Content<T>, 'type'> & {
  config: MessageConfig
}