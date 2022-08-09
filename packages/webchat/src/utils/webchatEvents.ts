export const postMessageToParent = (type: string, value: any, chatId?: string) => {
  console.log('value', value)
  console.log('data', { type, value, chatId })
  window.parent?.postMessage({ type, value, chatId }, '*')
}
