import { uuid } from '@botpress/framework'

export interface Sender {
  id: uuid
  identityId: uuid
  name: string
}
