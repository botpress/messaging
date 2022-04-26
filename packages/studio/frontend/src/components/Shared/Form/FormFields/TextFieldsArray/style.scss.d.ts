export type Styles = {
  error: string
  icon: string
  success: string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
