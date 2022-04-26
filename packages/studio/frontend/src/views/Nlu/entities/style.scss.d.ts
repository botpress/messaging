export type Styles = {
  configPane: string
  configPopover: string
  dataPane: string
  entityEditorBody: string
  occurrence: string
  occurrenceName: string
  occurrencesList: string
  regexInputDash: string
  validationTag: string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
