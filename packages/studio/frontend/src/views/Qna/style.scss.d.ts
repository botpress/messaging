export type Styles = {
  addBtn: string
  collapsibleWrapper: string
  content: string
  contentAnswer: string
  contextInput: string
  contextSelector: string
  empty: string
  errorIcon: string
  errorsList: string
  hasError: string
  header: string
  headerWrapper: string
  highlightedQna: string
  initialLoading: string
  input: string
  items: string
  left: string
  loading: string
  qnaId: string
  questionHeader: string
  questionWrapper: string
  redirectTitle: string
  refTitle: string
  right: string
  searchWrapper: string
  tag: string
  textarea: string
  textareaWrapper: string
  warning: string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
