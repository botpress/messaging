import { DatabaseService } from '../database/service'

export abstract class Migration {
  constructor(protected readonly db: DatabaseService) {}

  abstract get meta(): MigrationMeta

  abstract up(): Promise<void>

  abstract down(): Promise<void>
}

export interface MigrationMeta {
  name: string
  description: string
  version: string
}
