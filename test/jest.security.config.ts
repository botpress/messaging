import ServerConfig from '../packages/messaging/server/test/tsconfig.json'
import type { Config } from '@jest/types'
import { pathsToModuleNameMapper } from 'ts-jest'

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  projects: [
    {
      rootDir: 'packages/messaging/server',
      testMatch: ['<rootDir>/test/security/**/(*.)test.ts'],
      displayName: { name: 'Messaging', color: 'white' },
      testEnvironment: 'node',
      transform: {
        '^.+\\.tsx?$': require.resolve('ts-jest')
      },
      globals: {
        'ts-jest': {
          tsconfig: '<rootDir>/test/tsconfig.json'
        }
      },
      globalSetup: '<rootDir>/test/jest.security.setup.ts',
      globalTeardown: '<rootDir>/test/jest.security.teardown.ts',
      clearMocks: true,
      moduleNameMapper: pathsToModuleNameMapper(ServerConfig.compilerOptions.paths, { prefix: '<rootDir>/test/' })
    }
  ]
}

export default config
