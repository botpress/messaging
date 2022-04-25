import { Migration } from '@botpress/messaging-engine'
import { InitMigration } from './0.0.1-init'
import { StatusMigration } from './0.1.19-status'
import { FixClientSchemaMigration } from './0.1.20-fix-client-schema'
import { ClientTokensMigration } from './0.1.21-client-tokens'
import { ChannelVersionsMigration } from './1.0.2-channel-versions'
import { UserTokensMigration } from './1.1.0-user-tokens'
import { ProvisionsMigration } from './1.1.5-a-provisions'
import { MoveProviderIdMigration } from './1.1.5-b-move-provider-id'
import { CustomChannelsMigration } from './1.1.7-custom-channels'

export const Migrations: { new (): Migration }[] = [
  InitMigration,
  StatusMigration,
  FixClientSchemaMigration,
  ClientTokensMigration,
  ChannelVersionsMigration,
  UserTokensMigration,
  ProvisionsMigration,
  MoveProviderIdMigration,
  CustomChannelsMigration
]
