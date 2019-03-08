const { debugLog, pkg } = require('../../utils')
const {
  getPackageDirPath,
  linkDistDir,
  setupRootDirectory,
} = require('./link.utils')

exports.createLink = async () => {
  if (!pkg) {
    debugLog('No package.json found')
    console.log("Could not find project's package.json")
    process.exit(0)
  }

  try {
    console.log(`Setting up link for ${pkg.name}...`)
    debugLog('package.json found')

    debugLog(`Located ${getPackageDirPath()}`)
    await linkDistDir()

    console.log(`Successfully linked ${pkg.name}!`)
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}
