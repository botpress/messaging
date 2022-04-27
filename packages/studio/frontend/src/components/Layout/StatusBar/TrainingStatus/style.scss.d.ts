export type Styles = {
  button: string
  danger: string
  text: string
  trainCenter: string
  trainCenter_icon: string
  trainCenter_icon_wrap: string
  trainCenter_lang: string
  trainCenter_lang_code: string
  trainStatus: string
  trainStatus_message_dark: string
  trainStatus_message_light: string
  trainStatus_message_spaced: string
  trainStatus_pending: string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
