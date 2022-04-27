export type Styles = {
  active: string
  customIcon: string
  link: string
  logo: string
  sidebar: string
  small_tag: string
  tag: string
  tooltipContent: string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
