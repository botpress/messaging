export type Styles = {
  expressionWrapper: string
  expressionWrapperActions: string
  fieldContainer: string
  fieldError: string
  flexContainer: string
  italic: string
  toggleLink: string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
