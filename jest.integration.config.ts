import type { Config } from '@jest/types'
import { defaults as tsjPreset } from 'ts-jest/presets'
import { pathsToModuleNameMapper } from 'ts-jest/utils'

const ClientConfig = require('./packages/client/tsconfig.test.json')
const SocketConfig = require('./packages/socket/tsconfig.test.json')

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  globalSetup: './jest.e2e.setup.ts',
  globalTeardown: './jest.e2e.teardown.ts',
  projects: [
    {
      rootDir: 'packages/client',
      testMatch: ['<rootDir>/test/**/(*.)test.ts'],
      displayName: { name: 'Client', color: 'blue' },
      testEnvironment: 'node',
      transform: {
        ...tsjPreset.transform
      },
      globals: {
        'ts-jest': {
          tsconfig: '<rootDir>/tsconfig.test.json'
        }
      },
      clearMocks: true,
      moduleNameMapper: pathsToModuleNameMapper(ClientConfig.compilerOptions.paths, { prefix: '<rootDir>/' })
    },
    {
      rootDir: 'packages/socket',
      testMatch: ['<rootDir>/test/**/(*.)test.ts'],
      displayName: { name: 'Socket', color: 'red' },
      testEnvironment: 'node',
      transform: {
        ...tsjPreset.transform
      },
      globals: {
        'ts-jest': {
          tsconfig: '<rootDir>/tsconfig.test.json'
        }
      },
      clearMocks: true,
      moduleNameMapper: pathsToModuleNameMapper(SocketConfig.compilerOptions.paths, { prefix: '<rootDir>/' })
    }
  ]
}

export default config
