export interface MultiLangText {
  [lang: string]: string
}

export interface Content {
  type: string
}

export interface TextContent extends Content {
  type: 'text'
  text: string | MultiLangText
  markdown?: boolean
}

export interface ImageContent extends Content {
  type: 'image'
  image: string
  title?: string | MultiLangText
}

export interface AudioContent extends Content {
  type: 'audio'
  audio: string
  title?: string | MultiLangText
}

export interface VideoContent extends Content {
  type: 'video'
  video: string
  title?: string | MultiLangText
}

export interface CarouselContent extends Content {
  type: 'carousel'
  items: CardContent[]
}

export interface CardContent extends Content {
  type: 'card'
  title: string | MultiLangText
  subtitle?: string | MultiLangText
  image?: string
  actions: ActionButton[]
}

export interface LocationContent extends Content {
  type: 'location'
  latitude: number
  longitude: number
  address?: string | MultiLangText
  title?: string | MultiLangText
}

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
  text: string | MultiLangText
}

export interface ActionOpenURL extends ActionButton {
  url: string
}

export interface ActionPostback extends ActionButton {
  payload: string
}

export interface ChoiceContent extends Content {
  type: 'single-choice'
  text: string | MultiLangText
  choices: ChoiceOption[]
}

export interface ChoiceOption {
  title: string | MultiLangText
  value: string
}
