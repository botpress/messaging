export type Styles = {
  endPort: string
  fn: string
  highlightedNode: string
  iconContainer: string
  invalidFlow: string
  item: string
  label: string
  missingConnection: string
  msg: string
  'node-container': string
  portContainer: string
  portLabel: string
  removeLinkButton: string
  returnPort: string
  'section-next': string
  'section-onEnter': string
  'section-onReceive': string
  'section-title': string
  'skill-call-node': string
  startPort: string
  subflowPort: string
  subtitle: string
  topPort: string
  trash: string
  waiting: string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
