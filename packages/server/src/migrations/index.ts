import { Migration } from '@botpress/messaging-engine'
import { StatusMigration } from './0.1.19-status'
import { FixClientSchemaMigration } from './0.1.20-fix-client-schema'

export const Migrations: { new (): Migration }[] = [StatusMigration, FixClientSchemaMigration]
