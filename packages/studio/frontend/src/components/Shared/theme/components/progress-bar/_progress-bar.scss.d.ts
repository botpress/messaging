export type Styles = {
  'bp3-dark': string
  'bp3-intent-danger': string
  'bp3-intent-primary': string
  'bp3-intent-success': string
  'bp3-intent-warning': string
  'bp3-no-animation': string
  'bp3-no-stripes': string
  'bp3-progress-bar': string
  'bp3-progress-meter': string
  'linear-progress-bar-stripes': string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
