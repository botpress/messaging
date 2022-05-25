import { uuid } from '@botpress/framework'

export interface UserToken {
  id: uuid
  userId: uuid
  token: string
  expiry: Date | undefined
}
