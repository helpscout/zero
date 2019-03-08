const { debugLog, pkg } = require('../../utils')
const {
  getPackageDirPath,
  linkDistDir,
  setupRootDirectory,
} = require('./link.utils')

const defaultOptions = {
  verbose: true,
}

exports.createLink = async (options = {}) => {
  const { verbose } = { ...defaultOptions, ...options }

  const log = (...args) => {
    if (verbose) {
      console.log(...args)
    }
  }

  if (!pkg) {
    debugLog('No package.json found')
    console.log("Could not find project's package.json")
    process.exit(0)
  }

  try {
    log(`Setting up link for ${pkg.name}...`)
    debugLog('package.json found')

    debugLog(`Located ${getPackageDirPath()}`)
    await linkDistDir()

    log(`Successfully linked ${pkg.name}!`)
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}
