import type {Config} from '@jest/types';
import { defaults } from 'jest-config'

const config: Config.InitialOptions = {
  bail: true,
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'tsx', 'css', 'd.ts'],
  roots: ['.'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    ".+\\.(css|styl|less|sass|scss)$": "jest-css-modules-transform"
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules', '<rootDir>/dist'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  verbose: true,
  moduleDirectories: ['node_modules', 'src'],
}

export default config
