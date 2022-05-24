import { uuid } from '@botpress/base'

export interface Sender {
  id: uuid
  identityId: uuid
  name: string
}
