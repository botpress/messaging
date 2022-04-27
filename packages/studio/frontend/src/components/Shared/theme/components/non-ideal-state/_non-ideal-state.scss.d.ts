export type Styles = {
  'bp3-dark': string
  'bp3-fill': string
  'bp3-non-ideal-state': string
  'bp3-non-ideal-state-visual': string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
