export type Styles = {
  active: string
  delete: string
  moreBtn: string
  moreBtnDots: string
  moreMenu: string
  moreMenuItem: string
  moreOptionsWrapper: string
  noHover: string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
