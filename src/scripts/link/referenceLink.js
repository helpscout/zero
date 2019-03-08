const fs = require('fs')
const path = require('path')
const { appDirectory, debugLog, pkg, symlinkContents } = require('../../utils')
const {
  getReferenceDir,
  linkDistDir,
  setupRootDirectory,
} = require('./link.utils')

exports.referenceLink = async () => {
  const args = process.argv.slice(2)
  const [ref] = args
  const refDir = getReferenceDir(ref)

  if (!appDirectory) {
    console.log('package.json cannot be found.')
    return
  }

  if (!ref) {
    debugLog('No reference defined')
    return
  }

  console.log(`Referencing link for ${ref}...`)

  if (!fs.existsSync(refDir)) {
    debugLog(`Could not locate ${refDir}`)
    console.log(`No link set up for ${ref}. Try running zero link`)
    return
  }

  debugLog(`Found target: ${refDir}`)

  const target = refDir
  const dest = path.join(appDirectory, '/node_modules/', ref)

  try {
    await symlinkContents(target, dest)
  } catch (err) {
    debugLog(err)
  }
}
