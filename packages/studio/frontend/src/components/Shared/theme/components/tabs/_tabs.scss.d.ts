export type Styles = {
  'bp3-dark': string
  'bp3-flex-expander': string
  'bp3-large': string
  'bp3-no-animation': string
  'bp3-tab': string
  'bp3-tab-indicator': string
  'bp3-tab-indicator-wrapper': string
  'bp3-tab-list': string
  'bp3-tab-panel': string
  'bp3-tabs': string
  'bp3-vertical': string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
