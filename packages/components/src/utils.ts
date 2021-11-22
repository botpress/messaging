import { InjectedIntl } from 'react-intl'
import snarkdown from 'snarkdown'
import { MessageConfig } from './typings'

export const renderUnsafeHTML = (message: string = '', escaped: boolean): string => {
  if (escaped) {
    message = message.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }

  const html = snarkdown(message)
  return html.replace(/<a href/gi, '<a target="_blank" href')
}

export class FallthroughIntl implements InjectedIntl {
  formats: any
  messages: { [id: string]: string } = {}
  defaultLocale: string = 'en'
  defaultFormats: any

  constructor(public locale: string = 'en') {}

  formatDate(value: ReactIntl.DateSource, options?: ReactIntl.IntlComponent.DateTimeFormatProps): string {
    return new Date(value).toLocaleDateString(this.locale, options)
  }
  formatTime(value: ReactIntl.DateSource, options?: ReactIntl.IntlComponent.DateTimeFormatProps): string {
    return new Date(value).toLocaleTimeString(this.locale, options)
  }
  formatRelative(value: ReactIntl.DateSource, options?: ReactIntl.FormattedRelative.PropsBase & { now?: any }): string {
    return new Date(value).toLocaleDateString(this.locale)
  }
  formatNumber(value: number, options?: ReactIntl.FormattedNumber.PropsBase): string {
    throw new Error('Method not implemented.')
  }
  formatPlural(value: number, options?: ReactIntl.FormattedPlural.Base): keyof ReactIntl.FormattedPlural.PropsBase {
    throw new Error('Method not implemented.')
  }

  formatMessage(
    messageDescriptor: ReactIntl.FormattedMessage.MessageDescriptor,
    values?: { [key: string]: ReactIntl.MessageValue }
  ): string {
    return messageDescriptor.defaultMessage || 'Missing default message'
  }

  formatHTMLMessage(
    messageDescriptor: ReactIntl.FormattedMessage.MessageDescriptor,
    values?: { [key: string]: ReactIntl.MessageValue }
  ): string {
    throw new Error('Method not implemented.')
  }
  now(): number {
    return new Date().getTime()
  }
  onError(error: string): void {
    throw new Error(error)
  }
}

export const defaultMessageConfig: MessageConfig = {
  escapeHTML: true,
  isInEmulator: false,
  onSendData: async () => {
    console.warn('onSendData was called but no handler was configured, set message.config.onSendData')
    return
  },
  onFileUpload: async (label, payload, file) => {
    console.warn('onFileUpload was called but no handler was configured, set message.config.onFileUpload')
    return
  },
  isLastGroup: true,
  isLastOfGroup: true,
  isBotMessage: true,
  noMessageBubble: false,
  intl: new FallthroughIntl(),
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
