const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const { appDirectory, debugLog, pkg, symlinkContents } = require('../../utils')

const root = process.env.HOME
const rootDir = path.join(root, '.zero')
const modulesDir = path.join(rootDir, 'node_modules')

exports.setupRootDirectory = () => {
  debugLog(`Setting up ${modulesDir}...`)
  if (!fs.existsSync(modulesDir)) {
    mkdirp.sync(modulesDir)
    debugLog(`Created ${modulesDir}`)
  }
}

exports.getPackageDirPath = () => {
  return path.join(modulesDir, pkg.name, path.dirname(pkg.main))
}

exports.getAppDistBasePath = () =>
  path.join(appDirectory, path.dirname(pkg.main))

exports.linkDistDir = async () => {
  const target = exports.getAppDistBasePath()
  const dest = exports.getPackageDirPath()

  return symlinkContents(target, dest)
}

exports.getReferenceDir = ref => {
  const args = process.argv.slice(2)
  const reference = ref || args[0]

  return path.join(modulesDir, reference)
}
