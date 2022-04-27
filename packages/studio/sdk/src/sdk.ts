import { bots, cms, dialog, events, ghost, IO, kvs, messaging, users } from './functions'
import { Logger } from './interfaces'

export interface sdk {
  version: string
  logger: Logger
  IO: IO
  events: events
  users: users
  dialog: dialog
  kvs: kvs
  bots: bots
  ghost: ghost
  cms: cms
  messaging: messaging
}
