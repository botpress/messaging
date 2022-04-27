export type Styles = {
  contentImgWrapper: string
  img: string
  primaryText: string
  secondaryText: string
  text: string
  textWrapper: string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
