export type Styles = {
  'action-item': string
  condition: string
  defaultValue: string
  editableInput: string
  extraItems: string
  fn: string
  icon: string
  imagePreview: string
  missingTranslation: string
  msg: string
  name: string
  rtl: string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
