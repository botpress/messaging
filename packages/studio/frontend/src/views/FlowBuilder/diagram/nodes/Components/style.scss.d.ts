export type Styles = {
  action: string
  active: string
  button: string
  content: string
  contentImgWrapper: string
  contentsWrapper: string
  contentWrapper: string
  danger: string
  debugInfo: string
  error: string
  errorIcon: string
  execute: string
  failure: string
  hasError: string
  hasJoinLabel: string
  headerWrapper: string
  hidden: string
  highlighted: string
  img: string
  in: string
  joinLabel: string
  large: string
  listen: string
  nodeWrapper: string
  out: string
  outRouting: string
  promptPortContent: string
  readOnly: string
  results: string
  router: string
  rtl: string
  say_something: string
  secondaryText: string
  'skill-call': string
  small: string
  smallButton: string
  standard: string
  'sub-workflow': string
  success: string
  text: string
  textWrapper: string
  total: string
  trigger: string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
