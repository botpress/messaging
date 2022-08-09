export const postMessageToParent = (type: string, value: any, chatId?: string) => {
  window.parent?.postMessage({ type, value, chatId }, '*')
}
