import ServerConfig from '../packages/messaging/server/test/tsconfig.json'
import type { Config } from '@jest/types'
import { pathsToModuleNameMapper } from 'ts-jest'

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  globalSetup: './jest.integration.setup.ts',
  globalTeardown: './jest.integration.teardown.ts',
  projects: [
    {
      rootDir: 'packages/messaging/server',
      testMatch: ['<rootDir>/test/integration/**/*.test.ts'],
      displayName: { name: 'Server', color: 'blue' },
      testEnvironment: 'node',
      transform: {
        '^.+\\.tsx?$': require.resolve('ts-jest')
      },
      globals: {
        'ts-jest': {
          tsconfig: '<rootDir>/test/tsconfig.json'
        }
      },
      clearMocks: true,
      moduleNameMapper: pathsToModuleNameMapper(ServerConfig.compilerOptions.paths, { prefix: '<rootDir>/test/' })
    }
  ]
}

export default config
