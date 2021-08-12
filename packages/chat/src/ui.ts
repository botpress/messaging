export const element = <K extends keyof HTMLElementTagNameMap, N extends Node>(
  type: K,
  parent: N,
  construct?: (node: HTMLElementTagNameMap[K]) => void
) => {
  const node = document.createElement(type) as Assignable<HTMLElementTagNameMap[K]>
  node.assignTo = (data) => {
    return node
  }

  construct?.(node)
  parent.appendChild(node)
  return node
}

export const text = <N extends Node>(data: string | undefined, parent: N) => {
  const text = document.createTextNode(data || '') as Assignable<Text>
  text.assignTo = (data) => {
    return text
  }

  parent.appendChild(text)
  return text
}

type Assignable<T> = T & {
  assignTo: (linked: T) => T
}
