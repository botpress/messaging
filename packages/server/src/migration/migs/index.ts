import { Migration } from '../migration'
import { UserTokenMigration } from './0.2.0-user-token'

export default [UserTokenMigration] as { new (): Migration }[]
