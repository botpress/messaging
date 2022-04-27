export type Styles = {
  active: string
  link: string
  logo: string
  sidebar: string
  tag: string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
