export const messageTypes = [
  'text',
  'audio',
  'file',
  'video',
  'image',
  'dropdown',
  'visit',
  'voice',
  'typing',
  'card',
  'carousel',
  'location',
  'single-choice',
  'quick_reply',
  'login_prompt',
  'session_reset',
  'custom',
  'unsupported' // This is a special type that is used as fallback for unsupported message types at runtime
] as const

type MessageTypeTuple = typeof messageTypes

export type MessageType = MessageTypeTuple[number]

export interface BaseContent<T extends MessageType> {
  type: T
  typing?: boolean
}

export interface VisitContent extends BaseContent<'visit'> {
  text: string
  timezone: number
  language: string
}

export interface TextContent extends BaseContent<'text'> {
  text: string
  markdown?: boolean
}

export interface ImageContent extends BaseContent<'image'> {
  image: string
  title?: string
}

export interface AudioContent extends BaseContent<'audio'> {
  audio: string
  title?: string
}

export interface VoiceContent extends BaseContent<'voice'> {
  audio: string
}

export interface VideoContent extends BaseContent<'video'> {
  video: string
  title?: string
}

export interface FileContent extends BaseContent<'file'> {
  file: string
  title?: string
}

export interface CarouselContent extends BaseContent<'carousel'> {
  items: Omit<CardContent, 'type'>[]
}

export interface CardContent extends BaseContent<'card'> {
  title: string
  subtitle?: string
  image?: string
  actions?: ActionButton<ActionType>[]
}

export interface LocationContent extends BaseContent<'location'> {
  latitude: number
  longitude: number
  address?: string
  title?: string
}

export type ActionType = 'Say something' | 'Open URL' | 'Postback'

export type ActionButton<A extends ActionType> = {
  action: A
  title: string
} & (A extends 'Say something'
  ? {
      text: string
    }
  : A extends 'Open URL'
  ? {
      url: string
    }
  : A extends 'Postback'
  ? {
      payload: string
    }
  : {})

export interface ChoiceContent extends BaseContent<'single-choice'> {
  text: string
  disableFreeText?: boolean
  choices: ChoiceOption[]
}

export interface QuickReplyContent extends BaseContent<'quick_reply'> {
  text: string
  payload: string
}

export interface ChoiceOption {
  title: string
  value: string
}

export interface DropdownContent extends BaseContent<'dropdown'> {
  message: string
  options: { label: string; value: string }[]
  allowCreation?: boolean
  placeholderText?: string
  allowMultiple?: boolean
  buttonText?: string
  width?: number
  displayInKeyboard?: boolean
  markdown?: boolean
}

export interface CustomComponentContent extends BaseContent<'custom'> {
  module: string
  component: string
  wrapped?: any
  payload?: any
}

export interface LoginPromptContent extends BaseContent<'login_prompt'> {}

export type Content<T extends MessageType> = T extends 'text'
  ? TextContent
  : T extends 'visit'
  ? VisitContent
  : T extends 'image'
  ? ImageContent
  : T extends 'audio'
  ? AudioContent
  : T extends 'voice'
  ? VoiceContent
  : T extends 'video'
  ? VideoContent
  : T extends 'file'
  ? FileContent
  : T extends 'carousel'
  ? CarouselContent
  : T extends 'card'
  ? CardContent
  : T extends 'location'
  ? LocationContent
  : T extends 'dropdown'
  ? DropdownContent
  : T extends 'single-choice'
  ? ChoiceContent
  : T extends 'quick_reply'
  ? QuickReplyContent
  : T extends 'login_prompt'
  ? LoginPromptContent
  : T extends 'custom'
  ? CustomComponentContent
  : T extends 'unsupported'
  ? BaseContent<'unsupported'>
  : never
