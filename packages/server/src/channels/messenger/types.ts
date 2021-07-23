export type MessengerAction = 'typing_on' | 'typing_off' | 'mark_seen'

export interface PersistentMenuItem {
  locale: string
  composer_input_disabled?: boolean
  call_to_actions?: CallToAction[] | null
}

export type CallToAction = WebUrlButton | PostbackButton | NestedButton

export interface WebUrlButton {
  type: 'web_url'
  url: string
  title: string
}

export interface PostbackButton {
  type: 'postback'
  title: string
  payload: string
}

export interface NestedButton {
  type: 'nested'
  title: string
  call_to_actions: CallToAction[]
}
