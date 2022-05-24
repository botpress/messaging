import { uuid } from '@botpress/base'

export interface Provider {
  id: uuid
  name: string
  sandbox: boolean
}
