import type { Config } from '@jest/types'
import { defaults as tsjPreset } from 'ts-jest/presets'

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
      clearMocks: true
    },
    {
      rootDir: 'packages/socket',
      testMatch: ['<rootDir>/test/**/(*.)test.ts'],
      displayName: { name: 'Socket', color: 'red' },
      testEnvironment: 'node',
      transform: {
        ...tsjPreset.transform
      },
      clearMocks: true
    }
  ]
}

export default config
