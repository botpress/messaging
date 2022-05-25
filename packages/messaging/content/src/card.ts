import { Content } from './content'

export interface CardContent extends Content {
  type: 'card'
  title: string
  subtitle?: string
  image?: string
  actions: ActionButton[]
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
  text: string
}

export interface ActionOpenURL extends ActionButton {
  url: string
}

export interface ActionPostback extends ActionButton {
  payload: string
}
