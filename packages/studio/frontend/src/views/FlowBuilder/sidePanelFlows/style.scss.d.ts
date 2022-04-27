export type Styles = {
  addWorkflowNode: string
  emptyState: string
  grabbable: string
  mainoverlay: string
  modalHeader: string
  overhidden: string
  referencedWorkflows: string
  rightPanel: string
  rightPanelActive: string
  section: string
  sidePanel: string
  tabs: string
  tag: string
  title: string
  toolItem: string
  toolPanel: string
  tree: string
  treeNode: string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
