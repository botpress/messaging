import { uuid } from '@botpress/messaging-base'

export interface Sender {
  id: uuid
  identityId: uuid
  name: string
}
