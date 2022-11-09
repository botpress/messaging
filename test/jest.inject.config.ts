import type { Config } from '@jest/types'
import { pathsToModuleNameMapper } from 'ts-jest'
import ServerConfig from '../packages/server/test/tsconfig.json'

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  projects: [
    {
      rootDir: 'packages/inject',
      testMatch: ['<rootDir>/**/*.test.ts'],
      displayName: { name: 'Server', color: 'white' },
      testEnvironment: 'jsdom',
      transform: {
        '^.+\\.tsx?$': require.resolve('ts-jest')
      },
      globals: {
        'ts-jest': {
          tsconfig: '<rootDir>/test/tsconfig.json'
        }
      },
      clearMocks: true,
      moduleNameMapper: {
        ...pathsToModuleNameMapper(ServerConfig.compilerOptions.paths, { prefix: '<rootDir>/test/' }),
        '\\.(css|less)$': '<rootDir>/test/cssmock.js'
      }
    }
  ]
}

export default config
