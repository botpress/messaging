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
  collectCoverageFrom: ['<rootDir>/packages/**/src/**/*.ts'],
  cacheDirectory: '.jest/cache',
  projects: [
    {
      testMatch: ['<rootDir>/packages/server/test/**/(*.)test.ts'],
      displayName: { name: 'Server', color: 'blue' },
      testEnvironment: 'node',
      transform: tsjPreset.transform,
      clearMocks: true,
      /*moduleNameMapper: {
        '^botpress/messaging-(.*)$': '<rootDir>/../$1/src'
      },*/
      globals: {
        'ts-jest': {
          tsconfig: '<rootDir>/packages/server/tsconfig.json'
        }
      }
    }
  ]
}

export default config
