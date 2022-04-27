export type Styles = {
  'bp3-dark': string
  'bp3-html-table': string
  'bp3-html-table-bordered': string
  'bp3-html-table-condensed': string
  'bp3-html-table-striped': string
  'bp3-interactive': string
  'bp3-small': string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
