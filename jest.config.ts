import type { Config } from '@jest/types'
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
      testMatch: ['<rootDir>/test/**/(*.)test.ts'],
      displayName: { name: 'Engine', color: 'green' },
      testEnvironment: 'node',
      transform: {
        ...tsjPreset.transform
      },
      clearMocks: true
    },
    {
      rootDir: 'packages/server',
      testMatch: ['<rootDir>/test/**/(*.)test.ts'],
      displayName: { name: 'Server', color: 'blue' },
      testEnvironment: 'node',
      transform: {
        ...tsjPreset.transform
      },
      clearMocks: true
    },
    {
      rootDir: 'packages/socket',
      testMatch: ['<rootDir>/test/**/(*.)test.ts'],
      displayName: { name: 'Socket', color: 'yellow' },
      testEnvironment: 'node',
      transform: {
        ...tsjPreset.transform
      },
      clearMocks: true
    },
    {
      rootDir: 'packages/components',
      testMatch: ['<rootDir>/test/**/(*.)test.tsx'],
      displayName: { name: 'Components', color: 'red' },
      roots: ['.'],
      transform: {
        ...tsjPreset.transform,
        '.+\\.(css|styl|less|sass|scss)$': 'jest-css-modules-transform'
      },
      testPathIgnorePatterns: ['<rootDir>/node_modules', '<rootDir>/dist'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
      moduleDirectories: ['node_modules', 'src'],
      testEnvironment: 'jsdom'
    }
  ]
}

export default config
