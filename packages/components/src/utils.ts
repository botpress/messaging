import MarkdownIt from 'markdown-it'
import { createIntl } from 'react-intl'
import { MessageConfig } from './typings'

export const markdownToHtml = (message: string = '', escaped: boolean): string => {
  if (escaped) {
    message = message.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }

  const md = new MarkdownIt({ linkify: true })
  md.linkify.set({
    fuzzyLink: false // Only convert valid URLs to links.
  })
  const html = md.render(message)
  return html.replace(/<a href/gi, '<a target="_blank" href')
}

export const defaultMessageConfig: MessageConfig = {
  escapeHTML: true,
  onSendData: async () => {
    console.warn('onSendData was called but no handler was configured, set message.config.onSendData')
    return
  },
  onFileUpload: async (_label, _payload, file) => {
    console.warn('onFileUpload was called but no handler was configured, set message.config.onFileUpload')
    return
  },
  isLastGroup: true,
  isLastOfGroup: true,
  isBotMessage: true,
  noMessageBubble: false,
  intl: createIntl({ locale: 'en' }),
  showTimestamp: false,
  bp: typeof window !== 'undefined' ? window?.botpress : undefined,
  messageId: 'default',
  sentOn: new Date(Date.now())
}

export function pick<T>(obj: T, keys: Partial<keyof T>[]): Partial<T> {
  return keys
    .filter((key) => key in obj)
    .reduce((acc, key) => {
      acc[key] = obj[key]
      return acc
    }, {} as Partial<T>)
}
