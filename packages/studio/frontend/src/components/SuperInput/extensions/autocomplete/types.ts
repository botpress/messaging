import TreeModel from 'tree-model'

export interface InfoCardProps {
  key: string
  type: string | null
  link: string | null
  docs: string | null
  evals: string | null
}

export type InfoCardComponent = (props: InfoCardProps) => () => HTMLDivElement

export interface DocNodeData {
  key: string
  link: string | null
  docs: string | null
  type: string | null
}

export type DocNode = TreeModel.Node<DocNodeData>
