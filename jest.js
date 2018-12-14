const jestConfig = require('kcd-scripts/jest')

module.exports = {
  ...jestConfig,
  testURL: 'http://localhost/',
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
}
