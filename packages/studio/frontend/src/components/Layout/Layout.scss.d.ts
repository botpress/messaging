export type Styles = {
  aside: string
  aside__logo: string
  'aside-tabs': string
  block: string
  'block-header': string
  'block-main': string
  container: string
  main: string
  'main-content': string
  mainLayout: string
  mainSplitPaneWToolbar: string
  sidebar: string
  'sidebar-tabs': string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
