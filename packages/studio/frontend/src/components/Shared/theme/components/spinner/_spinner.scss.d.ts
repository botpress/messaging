export type Styles = {
  'bp3-dark': string
  'bp3-intent-danger': string
  'bp3-intent-primary': string
  'bp3-intent-success': string
  'bp3-intent-warning': string
  'bp3-no-spin': string
  'bp3-spinner': string
  'bp3-spinner-animation': string
  'bp3-spinner-head': string
  'bp3-spinner-track': string
  'pt-spinner-animation': string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
