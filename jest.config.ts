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
      testMatch: ['<rootDir>/packages/server/test/**/(*.)test.ts'],
      displayName: { name: 'Server', color: 'blue' },
      testEnvironment: 'node',
      transform: {
        ...tsjPreset.transform,
        '.js': 'jest-esm-transformer'
      },
      // yn ^5.0.0 must be transformed using 'jest-esm-transformer' since it uses ESM modules: https://github.com/sindresorhus/yn/releases/tag/v5.0.0
      transformIgnorePatterns: ['node_modules/(?!(yn)/)'],
      clearMocks: true
    }
  ]
}

export default config
