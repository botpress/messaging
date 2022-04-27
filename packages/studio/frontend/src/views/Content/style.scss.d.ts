export type Styles = {
  cancel: string
  centered: string
  content: string
  contentListWrapper: string
  imagePreview: string
  missingTranslation: string
  modal: string
  tableWrapper: string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
