import { uuid } from '@botpress/base'

export interface Identity {
  id: uuid
  tunnelId: uuid
  name: string
}
