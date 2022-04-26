export type Styles = {
  active: string
  btn: string
  editor: string
  editorContainer: string
  floatingButtons: string
  hidden: string
  padding: string
  sidePanel: string
  status: string
  tab: string
  tabsContainer: string
  warning: string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
