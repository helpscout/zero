const jestConfig = require('@helpscout/zero/jest')

module.exports = Object.assign(jestConfig, {
  testURL: 'http://localhost/',
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
})
