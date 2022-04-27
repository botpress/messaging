export type Styles = {
  action_button: string
  action_disabled: string
  active: string
  container: string
  fullsize: string
  imagePreview: string
  infoTooltip: string
  item: string
  itemList: string
  itemListSelected: string
  label: string
  markdownRenderer: string
  right: string
  rightButtons: string
  searchBar: string
  sidePanel: string
  sidePanel_hidden: string
  sidePanel_section: string
  splashScreen: string
  toolbar: string
  yOverflowScroll: string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
