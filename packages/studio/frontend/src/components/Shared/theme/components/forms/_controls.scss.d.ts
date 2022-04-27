export type Styles = {
  'bp3-align-right': string
  'bp3-checkbox': string
  'bp3-control': string
  'bp3-control-indicator': string
  'bp3-control-indicator-child': string
  'bp3-dark': string
  'bp3-disabled': string
  'bp3-inline': string
  'bp3-large': string
  'bp3-radio': string
  'bp3-switch': string
  'bp3-switch-inner-text': string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
