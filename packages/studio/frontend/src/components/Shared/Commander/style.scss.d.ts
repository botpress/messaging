export type Styles = {
  admin: string
  category: string
  categoryWrapper: string
  command: string
  external: string
  headerWrapper: string
  item: string
  kbd: string
  module: string
  shortcut: string
  studio: string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
