export type Styles = {
  category: string
  name: string
  title: string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
