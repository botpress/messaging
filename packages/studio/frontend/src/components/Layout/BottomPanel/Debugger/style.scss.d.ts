export type Styles = {
  bar: string
  barContainer: string
  collapsibleContainer: string
  container: string
  content: string
  debuggerIcon: string
  error: string
  expanded: string
  group: string
  header: string
  hovering: string
  info: string
  infoBox: string
  inspecting: string
  inspector: string
  inspectorContainer: string
  item: string
  itemButton: string
  itemButtonIcon: string
  notFound: string
  ok: string
  percentBar: string
  processingItem: string
  processingItemName: string
  processingSection: string
  section: string
  sectionContainer: string
  slightBold: string
  splash: string
  stacktrace: string
  summaryTable: string
  tabError: string
  time: string
  triggerGroup: string
  triggersContainer: string
  truncate: string
  underline: string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
