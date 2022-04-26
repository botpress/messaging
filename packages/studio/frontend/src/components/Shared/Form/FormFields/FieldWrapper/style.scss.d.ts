export type Styles = {
  errorMessage: string
  label: string
  labelError: string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
