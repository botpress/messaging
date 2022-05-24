import { uuid } from '@botpress/base'

export interface ConduitStatus {
  conduitId: uuid
  numberOfErrors: number
  initializedOn: Date | undefined
  lastError: string | undefined
}
