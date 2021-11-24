import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  globalSetup: './test/jest.e2e.setup.ts',
  globalTeardown: './test/jest.e2e.teardown.ts',
  testMatch: ['**/test/e2e/**/(*.)test.ts']
}

export default config
