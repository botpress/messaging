import { uuid } from './uuid'

export interface User {
  id: uuid
  clientId: uuid
  data: Record<string, string> | null
}
