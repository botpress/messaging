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
  'login_prompt',
  'quick_reply',
  'session_reset',
  'custom',
  'unsupported' // This is a special type that is used as fallback for unsupported message types at runtime
] as const

type MessageTypeTuple = typeof messageTypes

export type MessageType = MessageTypeTuple[number]

export interface Content<T extends MessageType> {
  type: T
}

export interface TextContent extends Content<'text'> {
  text: string
  markdown?: boolean
}

export interface ImageContent extends Content<'image'> {
  image: string
  title?: string
}

export interface AudioContent extends Content<'audio'> {
  audio: string
  title?: string
}

export interface VoiceContent extends Content<'voice'> {
  audio: string
}

export interface VideoContent extends Content<'video'> {
  video: string
  title?: string
}

export interface FileContent extends Content<'file'> {
  type: 'file'
  file: string
  title?: string
}

export interface CarouselContent extends Content<'carousel'> {
  items: CardContent[]
}

export interface CardContent extends Content<'card'> {
  title: string
  subtitle?: string
  image?: string
  actions: ActionButton[]
}

export interface LocationContent extends Content<'location'> {
  latitude: number
  longitude: number
  address?: string
  title?: string
}

export type ContentType =
  | TextContent
  | ImageContent
  | AudioContent
  | VideoContent
  | CarouselContent
  | CardContent
  | LocationContent
  | FileContent
  | VoiceContent

export enum ButtonAction {
  SaySomething = 'Say something',
  OpenUrl = 'Open URL',
  Postback = 'Postback'
}

export interface ActionButton {
  action: ButtonAction
  title: string
}

export interface ActionSaySomething extends ActionButton {
  text: string
}

export interface ActionOpenURL extends ActionButton {
  url: string
}

export interface ActionPostback extends ActionButton {
  payload: string
}

export interface ChoiceContent extends Content<'single-choice'> {
  text: string
  choices: ChoiceOption[]
}

export interface ChoiceOption {
  title: string
  value: string
}

export interface CustomComponentContent extends Content<'custom'> {
  module: string
  component: string
  wrapped?: any
}
