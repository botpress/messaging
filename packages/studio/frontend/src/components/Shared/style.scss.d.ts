export type Styles = {
  badge: string
  contextMenuLabel: string
  error: string
  expandBtn: string
  fieldError: string
  fieldWrapper: string
  formHeader: string
  formLabel: string
  formSelect: string
  hasError: string
  input: string
  items: string
  noBorder: string
  noPadding: string
  noSelect: string
  ocean: string
  searchBar: string
  tag: string
  tagInput: string
  textarea: string
  textareaWrapper: string
  typeField: string
  warning: string
  white: string
  wrapper: string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
