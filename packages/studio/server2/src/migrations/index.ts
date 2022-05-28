import { Migration } from '@botpress/framework'
import { InitMigration } from './0.0.1-init'

export const Migrations: { new (): Migration }[] = [InitMigration]
