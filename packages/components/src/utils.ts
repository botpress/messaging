import { Content } from '@botpress/messaging-server/content-types'
import { InjectedIntl } from 'react-intl'
import snarkdown from 'snarkdown'

export const renderUnsafeHTML = (message: string = '', escaped: boolean): string => {
  if (escaped) {
    message = message.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }

  const html = snarkdown(message)
  return html.replace(/<a href/gi, '<a target="_blank" href')
}

const audio: Content<'audio'> = {
  type: 'audio'
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
    throw new Error('Method not implemented.')
  }
  formatRelative(value: ReactIntl.DateSource, options?: ReactIntl.FormattedRelative.PropsBase & { now?: any }): string {
    throw new Error('Method not implemented.')
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
    throw new Error('Method not implemented.')
  }
  onError(error: string): void {
    throw new Error('Method not implemented.')
  }
}

export function pick<T>(obj: T, keys: Partial<keyof T>[]): Partial<T> {
  return keys
    .filter((key) => key in obj)
    .reduce((acc, key) => {
      acc[key] = obj[key]
      return acc
    }, {} as Partial<T>)
}
