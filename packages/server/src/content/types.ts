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
  'session_reset',
  'custom',
  'unsupported' // This is a special type that is used as fallback for unsupported message types at runtime
] as const

type MessageTypeTuple = typeof messageTypes

export type MessageType = MessageTypeTuple[number]

export interface BaseContent<T extends MessageType> {
  type: T
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
  type: 'file'
  file: string
  title?: string
}

export interface CarouselContent extends BaseContent<'carousel'> {
  items: CardContent[]
}

export interface CardContent extends BaseContent<'card'> {
  title: string
  subtitle?: string
  image?: string
  actions: ActionButton<ActionType>[]
}

export interface LocationContent extends BaseContent<'location'> {
  latitude: number
  longitude: number
  address?: string
  title?: string
}

// export enum ButtonAction {
//   SaySomething = 'Say something',
//   OpenUrl = 'Open URL',
//   Postback = 'Postback'
// }

export type ActionType = 'Say something' | 'Open URL' | 'Postback'

export type ActionButton<A extends ActionType> = {
  action: A
  title: string
} & (A extends 'Say something'
  ? { text: string }
  : A extends 'Open URL'
  ? { url: string }
  : A extends 'Postback'
  ? { payload: string }
  : {})

const myBtn: ActionButton<'Say something'> = { action: 'Say something', title: 'yo', text: 'yo' }

export interface ChoiceContent extends BaseContent<'single-choice'> {
  text: string
  choices: ChoiceOption[]
}

// export const btnTypeGuard = (btn: ActionButton<ButtonAction>) => {
//   switch (btn.action) {
//     case ButtonAction.SaySomething:
//       return btn as ActionButton<ButtonAction.SaySomething>
//     case ButtonAction.OpenUrl:
//       return btn as ActionButton<ButtonAction.OpenUrl>
//     case ButtonAction.Postback:
//       return btn as ActionButton<ButtonAction.Postback>
//   }
// }

export const btnIs = <A extends ActionType>(x: ActionButton<ActionType>, type: A): x is ActionButton<A> => {
  return x.action === type
}

export const isSaySomething = (btn: ActionButton<ActionType>): btn is ActionButton<'Say something'> => {
  return btn.action === 'Say something'
}

export interface ChoiceOption {
  title: string
  value: string
}

export interface CustomComponentContent extends BaseContent<'custom'> {
  module: string
  component: string
  wrapped?: any
  payload?: any
}

export type Content<T extends MessageType> = T extends 'text'
  ? TextContent
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
  : T extends 'single-choice'
  ? ChoiceContent
  : T extends 'custom'
  ? CustomComponentContent
  : never
