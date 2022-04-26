export type Styles = {
  description: string
  editor: string
  insertBtn: string
  insertBtnMoreSpacing: string
  mention: string
  mentionSuggestions: string
  mentionSuggestionsEntry: string
  mentionSuggestionsEntryFocused: string
  mentionSuggestionsEntryText: string
  rtl: string
  variable: string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
