export type Styles = {
  boxed: string
  commonButtons: string
  container: string
  divide: string
  flex: string
  fullWidth: string
  hidden: string
  inspectorMenu: string
  item: string
  menu: string
  padded: string
  small: string
  tab: string
  tabContainer: string
  tabs: string
  verticalTab: string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
