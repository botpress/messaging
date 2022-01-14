import type { Config } from '@jest/types'
import { pathsToModuleNameMapper } from 'ts-jest'
import ServerConfig from '../packages/server/test/tsconfig.json'

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  globalSetup: './jest.e2e.setup.ts',
  globalTeardown: './jest.e2e.teardown.ts',
  projects: [
    {
      rootDir: 'packages/server',
      testMatch: ['<rootDir>/test/security/**/(*.)test.ts'],
      displayName: { name: 'Server', color: 'white' },
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
