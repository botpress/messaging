import ClientConfig from '../packages/messaging/client/test/tsconfig.json'
import SocketConfig from '../packages/messaging/socket/test/tsconfig.json'
import type { Config } from '@jest/types'
import { pathsToModuleNameMapper } from 'ts-jest'

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  projects: [
    {
      rootDir: 'packages/messaging/client',
      testMatch: ['<rootDir>/test/e2e/**/*.test.ts'],
      displayName: { name: 'Client', color: 'blue' },
      testEnvironment: 'node',
      transform: {
        '^.+\\.tsx?$': require.resolve('ts-jest')
      },
      globals: {
        'ts-jest': {
          tsconfig: '<rootDir>/test/tsconfig.json'
        }
      },
      globalSetup: '<rootDir>/test/jest.e2e.setup.ts',
      globalTeardown: '<rootDir>/test/jest.e2e.teardown.ts',
      clearMocks: true,
      moduleNameMapper: pathsToModuleNameMapper(ClientConfig.compilerOptions.paths, { prefix: '<rootDir>/test/' })
    },
    {
      rootDir: 'packages/messaging/socket',
      testMatch: ['<rootDir>/test/e2e/**/*.test.ts'],
      displayName: { name: 'Socket', color: 'blue' },
      testEnvironment: 'node',
      transform: {
        '^.+\\.tsx?$': require.resolve('ts-jest')
      },
      globals: {
        'ts-jest': {
          tsconfig: '<rootDir>/test/tsconfig.json'
        }
      },
      globalSetup: '<rootDir>/test/jest.e2e.setup.ts',
      globalTeardown: '<rootDir>/test/jest.e2e.teardown.ts',
      clearMocks: true,
      moduleNameMapper: pathsToModuleNameMapper(SocketConfig.compilerOptions.paths, { prefix: '<rootDir>/test/' })
    }
  ]
}

export default config
