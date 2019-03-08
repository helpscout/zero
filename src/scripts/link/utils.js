const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const spawn = require('cross-spawn')
const { exec } = require('child_process')
const { appDirectory, dlog, pkg, symlinkContents } = require('../../utils')

const root = process.env.HOME
const rootDir = path.join(root, '.zero')
const modulesDir = path.join(rootDir, 'node_modules')

exports.setupRootDirectory = () => {
  dlog(`Setting up ${modulesDir}...`)
  if (!fs.existsSync(modulesDir)) {
    mkdirp.sync(modulesDir)
    dlog(`Created ${modulesDir}`)
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

  await symlinkContents(target, dest)
}

exports.createLink = async () => {
  if (!pkg) {
    dlog('No package.json found')
    console.log("Could not find project's package.json")
    process.exit(0)
  }

  try {
    console.log(`Setting up link for ${pkg.name}...`)
    dlog('package.json found')
    exports.setupRootDirectory()

    dlog(exports.getPackageDirPath())
    exports.linkDistDir()

    console.log(`Successfully linked ${pkg.name}!`)
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

exports.referenceLink = async () => {
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

  if (!fs.existsSync(refDir)) {
    dlog(`Could not locate ${refDir}`)
    console.log(`No link set up for ${ref}. Try running zero link`)
    return
  }

  dlog(`Found target: ${refDir}`)

  const target = refDir
  const dest = path.join(appDirectory, '/node_modules/', ref)

  try {
    await symlinkContents(target, dest)
  } catch (err) {
    dlog(err)
  }
}