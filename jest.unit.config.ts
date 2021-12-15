import ServerConfig from './packages/server/test/tsconfig.json'
import type { Config } from '@jest/types'
import { pathsToModuleNameMapper } from 'ts-jest'
import { defaults as tsjPreset } from 'ts-jest/presets'

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  // TODO: Re-enable coverage threshold once we have enough tests
  /*coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60
    }
  }*/
  projects: [
    {
      rootDir: 'packages/engine',
      testMatch: ['<rootDir>/test/unit/**/(*.)test.ts'],
      displayName: { name: 'Engine', color: 'green' },
      testEnvironment: 'node',
      transform: {
        ...tsjPreset.transform
      },
      clearMocks: true
    },
    {
      rootDir: 'packages/server',
      testMatch: ['<rootDir>/test/unit/**/(*.)test.ts'],
      displayName: { name: 'Server', color: 'blue' },
      testEnvironment: 'node',
      transform: {
        ...tsjPreset.transform
      },
      globals: {
        'ts-jest': {
          tsconfig: '<rootDir>/test/tsconfig.json'
        }
      },
      clearMocks: true,
      moduleNameMapper: pathsToModuleNameMapper(ServerConfig.compilerOptions.paths, { prefix: '<rootDir>/test/' })
    },
    {
      rootDir: 'packages/components',
      testMatch: ['<rootDir>/test/unit/**/(*.)test.tsx'],
      displayName: { name: 'Components', color: 'red' },
      roots: ['.'],
      transform: {
        ...tsjPreset.transform,
        '.+\\.(css|styl|less|sass|scss)$': 'jest-css-modules-transform'
      },
      setupFilesAfterEnv: ['<rootDir>/test/jest.setup.ts'],
      moduleDirectories: ['node_modules', 'src'],
      testEnvironment: 'jsdom'
    }
  ]
}

export default config
