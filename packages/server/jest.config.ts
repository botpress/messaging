import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testMatch: ['**/test/**/(*.)test.ts'],
  clearMocks: true
  // TODO: Re-enable coverage threshold once we have enough tests
  /*coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60
    }
  }*/
}

export default config
