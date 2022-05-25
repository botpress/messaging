import { uuid } from '@botpress/framework'

export interface ConduitStatus {
  conduitId: uuid
  numberOfErrors: number
  initializedOn: Date | undefined
  lastError: string | undefined
}
