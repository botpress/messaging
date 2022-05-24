import { uuid } from '@botpress/framework'

export interface Provider {
  id: uuid
  name: string
  sandbox: boolean
}
