import { uuid } from '../base/types'

export interface Provider {
  id: uuid
  name: string
  sandbox: boolean
}
