import MessagingServerConfig from '../packages/messaging/server/test/tsconfig.json'
import StudioServerConfig from '../packages/studio/server/test/tsconfig.json'

import type { Config } from '@jest/types'
import { pathsToModuleNameMapper } from 'ts-jest'

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  projects: [
    {
      rootDir: 'packages/base/engine',
      testMatch: ['<rootDir>/test/unit/**/*.test.ts'],
      displayName: { name: 'Engine', color: 'green' },
      testEnvironment: 'node',
      transform: {
        '^.+\\.tsx?$': require.resolve('ts-jest')
      },
      clearMocks: true
    },
    {
      rootDir: 'packages/messaging/server',
      testMatch: ['<rootDir>/test/unit/**/*.test.ts'],
      displayName: { name: 'Server', color: 'blue' },
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
      moduleNameMapper: pathsToModuleNameMapper(MessagingServerConfig.compilerOptions.paths, {
        prefix: '<rootDir>/test/'
      })
    },
    {
      rootDir: 'packages/webchat/components',
      testMatch: ['<rootDir>/test/unit/**/*.test.tsx'],
      displayName: { name: 'Components', color: 'red' },
      roots: ['.'],
      transform: {
        '^.+\\.tsx?$': require.resolve('ts-jest'),
        '.+\\.(css|styl|less|sass|scss)$': 'jest-css-modules-transform'
      },
      setupFilesAfterEnv: ['<rootDir>/test/jest.setup.ts'],
      moduleDirectories: ['src'],
      testEnvironment: 'jsdom'
    },
    {
      rootDir: 'packages/studio/server',
      testMatch: ['<rootDir>/test/unit/**/*.test.ts'],
      displayName: { name: 'Studio', color: 'magenta' },
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
      moduleNameMapper: pathsToModuleNameMapper(StudioServerConfig.compilerOptions.paths, { prefix: '<rootDir>/test/' })
    }
  ]
}

export default config
