// Jest config: test runner settings
module.exports = {
  // Use Node.js test environment
  testEnvironment: 'node',
  // Set env variables available during tests
  testEnvironmentOptions: {
    NODE_ENV: 'test',
  },
  // Restore spies/mocks automatically between tests
  restoreMocks: true,
  // Skip coverage for infrastructure folders (adjust as needed)
  coveragePathIgnorePatterns: ['node_modules', 'src/config', 'src/app.js', 'tests'],
  // Emit multiple coverage formats for CI and local use
  coverageReporters: ['text', 'lcov', 'clover', 'html'],
};
