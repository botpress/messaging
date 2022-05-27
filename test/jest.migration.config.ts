import ServerConfig from '../packages/messaging/server/test/tsconfig.json'
import type { Config } from '@jest/types'
import { pathsToModuleNameMapper } from 'ts-jest'

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  projects: [
    {
      rootDir: 'packages/messaging/server',
      testMatch: ['<rootDir>/test/migration/**/(*.)test.ts'],
      displayName: { name: 'Messaging', color: 'blue' },
      testEnvironment: 'node',
      transform: {
        '^.+\\.tsx?$': require.resolve('ts-jest')
      },
      globals: {
        'ts-jest': {
          tsconfig: '<rootDir>/test/tsconfig.json'
        }
      },
      globalSetup: '<rootDir>/test/jest.migration.setup.ts',
      globalTeardown: '<rootDir>/test/jest.migration.teardown.ts',
      clearMocks: true,
      moduleNameMapper: pathsToModuleNameMapper(ServerConfig.compilerOptions.paths, { prefix: '<rootDir>/test/' })
    }
  ]
}

export default config
