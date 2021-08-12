import { uuid } from '@botpress/messaging-base'

export interface Client {
  id: uuid
  providerId: uuid
  token?: string
}
