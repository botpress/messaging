import type { Config } from '@jest/types'
import { defaults as tsjPreset } from 'ts-jest/presets'

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  projects: [
    {
      testMatch: ['<rootDir>/test/**/(*.)test.ts'],
      displayName: { name: 'Socket', color: 'blue' },
      testEnvironment: 'node',
      transform: {
        ...tsjPreset.transform
      },
      clearMocks: true
    }
  ]
}

export default config
