import FrameworkConfig from '../packages/base/framework/test/tsconfig.json'
import MessagingServerConfig from '../packages/messaging/server/test/tsconfig.json'
import type { Config } from '@jest/types'
import { pathsToModuleNameMapper } from 'ts-jest'

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  projects: [
    {
      rootDir: 'packages/messaging/server',
      testMatch: ['<rootDir>/test/integration/**/*.test.ts'],
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
      globalSetup: '<rootDir>/test/jest.integration.setup.ts',
      globalTeardown: '<rootDir>/test/jest.integration.teardown.ts',
      clearMocks: true,
      moduleNameMapper: pathsToModuleNameMapper(MessagingServerConfig.compilerOptions.paths, {
        prefix: '<rootDir>/test/'
      })
    },
    {
      rootDir: 'packages/base/framework',
      testMatch: ['<rootDir>/test/integration/**/*.test.ts'],
      displayName: { name: 'Framework', color: 'yellow' },
      testEnvironment: 'node',
      transform: {
        '^.+\\.tsx?$': require.resolve('ts-jest')
      },
      globals: {
        'ts-jest': {
          tsconfig: '<rootDir>/test/tsconfig.json'
        }
      },
      globalSetup: '<rootDir>/test/jest.integration.setup.ts',
      globalTeardown: '<rootDir>/test/jest.integration.teardown.ts',
      clearMocks: true,
      moduleNameMapper: pathsToModuleNameMapper(FrameworkConfig.compilerOptions.paths, { prefix: '<rootDir>/test/' })
    }
  ]
}

export default config
