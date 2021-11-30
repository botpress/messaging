import { uuid } from '@botpress/messaging-base'

export interface ConduitStatus {
  conduitId: uuid
  numberOfErrors: number
  initializedOn: Date | undefined
  lastError: string | undefined
}
