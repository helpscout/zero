const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const { appDirectory, dlog, pkg } = require('../../utils')

const root = process.env.HOME
const rootDir = path.join(root, '.zero')
const modulesDir = path.join(rootDir, 'node_modules')

exports.setupRootDirectory = () => {
  dlog(`Setting up ${modulesDir}...`)
  if (!fs.existsSync(modulesDir)) {
    mkdirp.sync(modulesDir)
    if (isDebug) {
      dlog(`Created ${modulesDir}`)
    }
  }
}

exports.getPackageDirPath = () => path.join(modulesDir, pkg.name)

exports.createLinkDir = () => {
  const packageDirPath = exports.getPackageDirPath()
  mkdirp.sync(packageDirPath)
  dlog(`Created ${packageDirPath}`)
}

exports.createLinkDistDir = () => {
  const distDir = exports.getDistDir()
  if (distDir) {
    dlog(`Creating ${distDir}...`)
    mkdirp.sync(distDir)
  }
}

exports.getAppDistBasePath = () =>
  path.join(appDirectory, path.dirname(pkg.main))

exports.getDistDir = () => {
  const { main } = pkg
  if (!main) {
    dlog('No main in package.json')
    return
  }
  return path.join(exports.getPackageDirPath(), path.dirname(main))
}

exports.linkDistDir = () => {
  const target = exports.getAppDistBasePath()
  const dest = exports.getPackageDirPath()
  const distDir = exports.getDistDir()

  if (fs.existsSync(distDir)) {
    dlog(`${distDir} exists`)
    dlog(`Deleting ${distDir}...`)
    fs.unlinkSync(distDir)
  }

  dlog(`Symlinking ${target} to ${dest}...`)
  // TODO! OMG! REMOVE THIS! DO DIST FOR REAL!
  fs.symlinkSync(target, `${dest}/dist`)
}

exports.createLink = () => {
  if (!pkg) {
    dlog('No package.json found')
    console.log("Could not find project's package.json")
    process.exit(0)
  }

  try {
    console.log(`Setting up link for ${pkg.name}...`)
    dlog('package.json found')
    exports.setupRootDirectory()

    exports.createLinkDir()
    // exports.createLinkDistDir()

    exports.linkDistDir()
    console.log(`Successfully linked ${pkg.name}!`)

    // TODO! OMG! REMOVE THIS! DO DIST FOR REAL!
    // fs.symlinkSync(target, `${dest}/dist`)
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

exports.getReferenceDir = ref => {
  const args = process.argv.slice(2)
  const reference = ref || args[0]

  return path.join(modulesDir, reference)
}

exports.referenceLink = () => {
  const args = process.argv.slice(2)
  const [ref] = args
  const refDir = exports.getReferenceDir(ref)

  if (!appDirectory) {
    console.log('package.json cannot be found.')
    return
  }

  if (!ref) {
    dlog('No reference defined')
    return
  }

  console.log(`Referencing link for ${ref}...`)

  dlog(refDir)
  if (!fs.existsSync(refDir)) {
    dlog(`Could not locate ${refDir}`)
    console.log(`No link set up for ${ref}. Try running zero link`)
    return
  }

  dlog(`Found ${refDir}`)

  // look for reference directory within .zero/node_modules
  // TODO: SERIOUSLY, REMOVE HARD CODED /dist
  const target = path.join(refDir, '/dist')
  const dest = path.join(appDirectory, '/node_modules/', ref, '/dist')

  if (fs.existsSync(dest)) {
    dlog('Deleting previous reference', dest)
    fs.unlinkSync(dest)
  }

  fs.symlinkSync(target, dest)
}
