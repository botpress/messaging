export type Styles = {
  'bp3-align-left': string
  'bp3-align-right': string
  'bp3-dark': string
  'bp3-fixed-top': string
  'bp3-navbar': string
  'bp3-navbar-divider': string
  'bp3-navbar-group': string
  'bp3-navbar-heading': string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
