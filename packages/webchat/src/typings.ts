import { RootStore } from './store'
import { BPStorage } from './utils/storage'

declare global {
  interface Window {
    __BP_VISITOR_SOCKET_ID: string
    __BP_VISITOR_ID: string
    botpressWebChat: any
    store: RootStore
    BOT_ID: string
    SEND_USAGE_STATS: boolean
    USE_SESSION_STORAGE: boolean
    BP_STORAGE: BPStorage
    botpress: {
      [moduleName: string]: any
    }
  }
}

export namespace Renderer {
  export interface Message {
    type?: string
    className?: string
    payload?: any
    store?: RootStore
    bp?: StudioConnector
    fromLabel?: string
    messageId?: uuid
    /** When true, the message isn't wrapped by its bubble */
    noBubble?: boolean
    keyboard?: any
    eventId?: string

    isLastGroup?: boolean
    isLastOfGroup?: boolean
    isBotMessage?: boolean
    isLastMessage?: boolean
    sentOn?: Date
    inlineFeedback?: any

    onSendData?: (data: any) => Promise<void>
    onFileUpload?: (label: string, payload: any, file: File) => Promise<void>

    /** Allows to autoplay voice messages coming from the bot */
    onAudioEnded?: () => void
    shouldPlay?: boolean
  }

  export type Button = {
    label: string
    payload: any
    preventDoubleClick: boolean
    onButtonClick: (title: any, payload: any) => void
  } & Pick<Message, 'onFileUpload'>

  export type Text = {
    text: string
    markdown: boolean
    escapeHTML: boolean
    intl?: any
    maxLength?: number
  } & Message

  export interface Option {
    label: string
    value: string
  }

  export type Dropdown = {
    options: Option[]
    buttonText?: string
    escapeHTML: boolean
    allowCreation?: boolean
    placeholderText?: string
    allowMultiple?: boolean
    width?: number
    markdown: boolean
    message: string
    displayInKeyboard?: boolean
  } & Message

  export type QuickReply = {
    buttons: any
    quick_replies: any
    disableFreeText: boolean
  } & Message

  export type QuickReplyButton = {
    allowMultipleClick: boolean
    title: string
  } & Button

  export interface FileMessage {
    file: {
      url: string
      title: string
      storage: string
      text: string
    }
    escapeTextHTML: boolean
  }

  export interface VoiceMessage {
    file: {
      type: string
      audio: string
      autoPlay?: boolean
    }

    shouldPlay: boolean
    onAudioEnded: () => void
  }

  export interface FileInput {
    onFileChanged: (event: HTMLInputEvent) => void
    name: string
    className: string
    accept: string
    placeholder: string
    disabled?: boolean
  }

  export interface Carousel {
    elements: Card[]
    settings: any
  }

  export interface Card {
    picture: string
    title: string
    subtitle: string
    buttons: CardButton[]
  }

  export interface CardButton {
    url: string
    title: string
    type: string
    payload: any
    text: string
  }
}

export namespace View {
  export type MenuAnimations = 'fadeIn' | 'fadeOut' | undefined
}

/** These are the functions exposed by the studio to the modules */
export interface StudioConnector {
  /** Event emitter */
  events: any
  /** An axios instance */
  axios: any
  getModuleInjector: any
  loadModuleView: any
}

export interface Config {
  /** Url of the messaging server */
  messagingUrl: string
  /** Id of your messaging client */
  clientId: string
  /**
   * Url of the Media File Service where we fetch the bot info
   * @default ''
   */
  mediaFileServiceUrl?: string
  /**
   * Key used to encrypt data in the localStorage
   * @default '''
   */
  encryptionKey?: string
  /**
   * Provide a path to a stylesheet to customize the webchat
   * @default '''
   */
  stylesheet?: string
  /**
   * If false, will hide the conversation list pane
   * @default true
   */
  showConversationsButton?: boolean
  /**
   * If true, will display a timestamp under each messages
   * @default false
   */
  showTimestamp?: boolean
  /**
   * Allows the user to download the conversation history
   * @default true
   */
  enableTranscriptDownload?: boolean
  /**
   * Allows the user to delete its conversation history
   * @default false
   */
  enableConversationDeletion?: boolean
  /**
   * Close the webchat when pressing the Esc key
   * @default true
   */
  closeOnEscape?: boolean
  /**
   * Displays the bot name to the right of its avatar
   * @default ''
   */
  botName?: string
  /**
   * Allows to set a custom composer placeholder
   * @default 'Reply to {name}'
   */
  composerPlaceholder?: string
  /**
   * Allow to specify a custom URL for the bot's avatar
   * @default '''
   */
  avatarUrl?: string
  /** Force the display language of the webchat (en, fr, ar, ru, etc..)
   * Defaults to the user's browser language if not set
   * Set to 'browser' to force use the browser's language
   * @default 'browser'
   */
  locale?: 'browser' | string
  /**
   * Small description written under the bot's name
   * @default ''
   */
  botConversationDescription?: string
  /**
   * When true, the widget button to open the chat is hidden
   * @default false
   */
  hideWidget?: boolean
  /**
   * Disable the slide in / out animations of the webchat
   * @default false
   */
  disableAnimations?: boolean
  /**
   * When true, webchat displays a voice icon in the composer to send voice messages (must use Google Speech integration)
   * @default false
   */
  enableVoiceComposer?: boolean
  /**
   * Use sessionStorage instead of localStorage, which means the session expires when tab is closed
   * @default false
   */
  useSessionStorage?: boolean
  /**
   * Sends an event to the parent container with the width provided
   * @default 360
   */
  containerWidth?: string | number
  /**
   * Sets the width of the webchat
   * @default 360
   */
  layoutWidth?: string | number
  /**
   * Show Powered By Botpress in the footer
   * @default false
   */
  showPoweredBy?: boolean
  /**
   * When enabled, sent messages are persisted to local storage (recall previous messages)
   * @default true
   */
  enablePersistHistory?: boolean
  /**
   * Experimental: expose the store to the parent frame for more control on the webchat's behavior
   * @default false
   */
  exposeStore?: boolean
  /**
   * If true, Websocket is created when the Webchat is opened. Bot cannot be proactive.
   * @default false
   */
  lazySocket?: boolean
  /**
   * If true, chat will no longer play the notification sound for new messages.
   * @default false
   */
  disableNotificationSound?: boolean
  /**
   * Refers to a specific webchat reference in parent window. Useful when using multiple chat window
   * @default ''
   */
  chatId?: string
  /**
   * CSS class to be applied to iframe
   * @default ''
   */
  className?: string
  /**
   * Google Maps API Key required to display the map.
   * Will display a link to Google Maps otherwise
   * @default ''
   */
  googleMapsAPIKey?: string
  /**
   * Allows setting a custom user id
   */
  customUser?: {
    userId: string
    userToken: string
  }
}

export interface BotDetails {
  website?: string
  phoneNumber?: string
  termsConditions?: string
  privacyPolicy?: string
  emailAddress?: string
  avatarUrl?: string
  coverPictureUrl?: string
}

export interface BotInfo {
  name: string
  description: string
  details: BotDetails
  showBotInfoPage: boolean
  languages: string[]
  security: {
    escapeHTML: boolean
  }
  lazySocket: boolean
  extraStylesheet?: string
  disableNotificationSound?: boolean
}

export type uuid = string

export interface Conversation {
  id: uuid
  clientId: uuid
  userId: uuid
  createdOn: Date
}

export interface RecentConversation extends Conversation {
  lastMessage?: Message
}

/** Represents the current conversation with all messages */
export type CurrentConversation = {
  botId: string
  messages: Message[]
  userId: string
  user_last_seen_on: Date | undefined
  /** Event ?  */
  typingUntil: any
} & Conversation

export interface Message {
  id: uuid
  conversationId: uuid
  authorId: uuid | undefined
  sentOn: Date
  payload: any
  // The typing delay in ms
  timeInMs?: number
}

export interface QueuedMessage {
  message: Message
  showAt: Date
}

export interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget
}

export interface ChatDimensions {
  /**
   * The container is the frame around the webchat.
   * Setting the container bigger than the layout makes it possible to add components
   */
  container: string | number
  /** The layout is the zone where the user speaks with the bot */
  layout: string | number
}

export interface CustomButton {
  /** An ID to identify your button. It is required to remove it */
  id: string
  /** This text will be displayed when the mouse is over the button */
  label?: string
  /** Supply either a function or an element which will render the button */
  icon: Function | JSX.Element
  /** The event triggered when the button is clicked */
  onClick: (buttonId: string, headerComponent: JSX.Element, event: React.MouseEvent) => void
}

export interface CustomAction {
  /** An ID to identify your action. It is required to remove it */
  id: string
  /** This text will be displayed in the context menu */
  label: string
  /** The event triggered when the action is clicked */
  onClick: (actionId: string, messageProps: any, event: React.MouseEvent) => void
}

export interface EventFeedback {
  messageId: uuid
  feedback?: number
}
