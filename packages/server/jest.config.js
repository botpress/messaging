/** @type {import('@ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/(*.)test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/dist/'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60
    }
  }
}
