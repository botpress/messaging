import { Migration } from '@botpress/messaging-engine'
import { StatusMigration } from './0.1.18-status'

export const Migrations: { new (): Migration }[] = [StatusMigration]
