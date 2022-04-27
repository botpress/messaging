export type Styles = {
  botName: string
  flag: string
  flagWrapper: string
  item: string
  langItem: string
  langSwitherMenu: string
  statusBar: string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
