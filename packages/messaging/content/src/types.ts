export interface Content {
  type: string
}

export interface TextContent extends Content {
  type: 'text'
  text: string
  markdown?: boolean
}

export interface ImageContent extends Content {
  type: 'image'
  image: string
  title?: string
}

export interface AudioContent extends Content {
  type: 'audio'
  audio: string
  title?: string
}

export interface VoiceContent extends Content {
  type: 'voice'
  audio: string
}

export interface VideoContent extends Content {
  type: 'video'
  video: string
  title?: string
}

export interface FileContent extends Content {
  type: 'file'
  file: string
  title?: string
}

export interface CarouselContent extends Content {
  type: 'carousel'
  items: CardContent[]
}

export interface CardContent extends Content {
  type: 'card'
  title: string
  subtitle?: string
  image?: string
  actions: ActionButton[]
}

export interface LocationContent extends Content {
  type: 'location'
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

export interface ChoiceContent extends Content {
  type: 'single-choice'
  text: string
  choices: ChoiceOption[]
}

export interface ChoiceOption {
  title: string
  value: string
}
