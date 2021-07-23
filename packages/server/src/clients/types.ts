import { uuid } from '../base/types'

export interface Client {
  id: uuid
  providerId: uuid
  token?: string
}
