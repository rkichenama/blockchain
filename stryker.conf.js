module.exports = function (config) {
  config.set({
    mutator: 'javascript',
    packageManager: 'npm',
    reporters: ['clear-text', 'progress', 'html'],
    testRunner: 'jest',
    transpilers: [],
    coverageAnalysis: 'off',
    mutate: ['src/**/*.js', '!src/**/*.test.js', '!src/**/api.js', '!src/**/networkNode.js']
  });
};
