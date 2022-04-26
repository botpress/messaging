export type Styles = {
  h1: string
  h2: string
  h3: string
  h4: string
  h5: string
  h6: string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
