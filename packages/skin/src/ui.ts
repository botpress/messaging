export const element = <K extends keyof HTMLElementTagNameMap, N extends Node>(
  type: K,
  parent: N,
  construct?: (node: HTMLElementTagNameMap[K]) => void
) => {
  const node = document.createElement(type)

  try {
    construct?.(node)
  } catch (e) {
    node.appendChild(document.createTextNode(<any>e))
  }

  parent.appendChild(node)
  return node
}

export const text = <N extends Node>(data: string | undefined, parent: N) => {
  const text = document.createTextNode(data || '')
  parent.appendChild(text)
  return text
}
