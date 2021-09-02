import { uuid } from '@botpress/messaging-base'
import { Endpoint } from '../mapping/types'

export interface ActionSource {
  conduit?: { id: uuid; endpoint: Endpoint }
  client?: { id: uuid }
  socket?: { id: string }
}
