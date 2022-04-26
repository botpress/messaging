import { FlowNode } from 'botpress/sdk'

export { default as ElementPreview } from './ElementPreview'
export { toastSuccess, toastFailure, toastInfo, Timeout } from './Toaster'
export { Downloader } from './Downloader'
export { default as AccessControl, isOperationAllowed } from './AccessControl'

export const reorderFlows = (flows: (FlowNode | string)[]) =>
  [
    flows.find((x) => getName(x) === 'main'),
    flows.find((x) => getName(x) === 'error'),
    flows.find((x) => getName(x) === 'timeout'),
    ...flows.filter((x) => !['main', 'error', 'timeout'].includes(getName(x)))
  ].filter((x) => Boolean(x))

const getName = (x: FlowNode | string) => {
  let name = ''
  if (typeof x === 'string') {
    name = x
  } else {
    name = x.id || x.name
  }

  return name.replace(/\.flow\.json$/i, '')
}

export const getFlowLabel = (name: string) => {
  name = name.replace(/\.flow\.json$/i, '')
  if (name === 'main') {
    return 'Main'
  } else if (name === 'error') {
    return 'Error handling'
  } else if (name === 'timeout') {
    return 'Timeout'
  } else if (name === 'conversation_end') {
    return 'Conversation End'
  } else {
    return name
  }
}
