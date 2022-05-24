import { uuid } from '@botpress/framework'

export interface Identity {
  id: uuid
  tunnelId: uuid
  name: string
}
