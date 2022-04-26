import { Migration } from '@botpress/messaging-engine'

export class InitMigration extends Migration {
  meta = {
    name: InitMigration.name,
    description: 'Create initial tables',
    version: '0.0.1'
  }

  async valid() {
    return true
  }

  async applied() {
    return this.isDown
  }

  // TODO: need to put the initial tables here

  async up() {}

  async down() {}
}
