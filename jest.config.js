/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  // preset: 'ts-jest',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: './tsconfig.json',
    }
  },
  // setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
  collectCoverageFrom,
  collectCoverage: true,
  coverageReporters: ['json', 'html', ['text', { skipFull: true }]],
  coverageDirectory: '<rootDir>/coverage/',
  testPathIgnorePatterns: [
    '/node_modules/',
  ],
  testResultsProcessor: 'jest-junit',
}