export type Styles = {
  active: string
  clickable: string
  cta_btn: string
  cta_tooltip: string
  disabled: string
  divider: string
  item: string
  itemSpacing: string
  label: string
  layoutControls: string
  shortcut: string
  shortcutLabel: string
  tooltip: string
  topNav: string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
