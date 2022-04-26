export type Styles = {
  active: string
  clickable: string
  divider: string
  header: string
  item: string
  itemSpacing: string
  label: string
  list: string
  shortcut: string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
