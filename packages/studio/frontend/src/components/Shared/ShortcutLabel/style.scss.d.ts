export type Styles = {
  baseLineHeight: string
  light: string
  noLineHeight: string
  shortcut: string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
