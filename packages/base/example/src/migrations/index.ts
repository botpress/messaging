import { Migration } from '@botpress/messaging-engine'
import { InitMigration } from './0.0.1-init'

export const Migrations: { new (): Migration }[] = [InitMigration]
