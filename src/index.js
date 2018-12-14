#!/usr/bin/env node

const args = process.argv.slice(2)
const command = args[0]
const cmd = command && command.toLowerCase()

if (cmd && cmd === 'build') {
  /* eslint dot-notation: 0 */
  if (!process.env['BABEL_ENV']) {
    process.env['BABEL_ENV'] = 'production'
  }
}

if (cmd && cmd === 'prestart') {
  const prestart = require('@helpscout/prestart')
  prestart.sync()
  return
}

require('kcd-scripts/dist/index')
