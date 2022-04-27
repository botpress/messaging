export type Styles = {
  invalid: string
  key: string
  keyTip: string
  mandatory: string
  table: string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
