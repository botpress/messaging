export type Styles = {
  actionDialogContent: string
  actionIcons: string
  actionList: string
  actions: string
  actionSelectItem: string
  actionServer: string
  bottomSection: string
  category: string
  description: string
  endBloc: string
  formHeader: string
  item: string
  name: string
  node: string
  nodeBloc: string
  returnBloc: string
  returnToNodeSection: string
  section: string
  subflowBloc: string
  textFields: string
  tip: string
  toSubflowSection: string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
