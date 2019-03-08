const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const rimraf = require('rimraf')
const mkdirp = require('mkdirp')
const arrify = require('arrify')
const has = require('lodash.has')
const readPkgUp = require('read-pkg-up')
const which = require('which')

const { pkg, path: pkgPath } = readPkgUp.sync({
  cwd: fs.realpathSync(process.cwd()),
})
const appDirectory = path.dirname(pkgPath)

function resolveKcdScripts() {
  return require.resolve('./').replace(process.cwd(), '.')
}

// eslint-disable-next-line complexity
function resolveBin(
  modName,
  { executable = modName, cwd = process.cwd() } = {}
) {
  let pathFromWhich
  try {
    pathFromWhich = fs.realpathSync(which.sync(executable))
  } catch (_error) {
    // ignore _error
  }
  try {
    const modPkgPath = require.resolve(`${modName}/package.json`)
    const modPkgDir = path.dirname(modPkgPath)
    const { bin } = require(modPkgPath)
    const binPath = typeof bin === 'string' ? bin : bin[executable]
    const fullPathToBin = path.join(modPkgDir, binPath)
    if (fullPathToBin === pathFromWhich) {
      return executable
    }
    return fullPathToBin.replace(cwd, '.')
  } catch (error) {
    if (pathFromWhich) {
      return executable
    }
    throw error
  }
}

const fromRoot = (...p) => path.join(appDirectory, ...p)
const hasFile = (...p) => fs.existsSync(fromRoot(...p))
const ifFile = (files, t, f) =>
  arrify(files).some(file => hasFile(file)) ? t : f

const hasPkgProp = props => arrify(props).some(prop => has(pkg, prop))

const hasPkgSubProp = pkgProp => props =>
  hasPkgProp(arrify(props).map(p => `${pkgProp}.${p}`))

const ifPkgSubProp = pkgProp => (props, t, f) =>
  hasPkgSubProp(pkgProp)(props) ? t : f

const hasScript = hasPkgSubProp('scripts')
const hasPeerDep = hasPkgSubProp('peerDependencies')
const hasDep = hasPkgSubProp('dependencies')
const hasDevDep = hasPkgSubProp('devDependencies')
const hasAnyDep = args => [hasDep, hasDevDep, hasPeerDep].some(fn => fn(args))

const ifPeerDep = ifPkgSubProp('peerDependencies')
const ifDep = ifPkgSubProp('dependencies')
const ifDevDep = ifPkgSubProp('devDependencies')
const ifAnyDep = (deps, t, f) => (hasAnyDep(arrify(deps)) ? t : f)
const ifScript = ifPkgSubProp('scripts')

function parseEnv(name, def) {
  if (envIsSet(name)) {
    try {
      return JSON.parse(process.env[name])
    } catch (err) {
      return process.env[name]
    }
  }
  return def
}

function envIsSet(name) {
  return (
    process.env.hasOwnProperty(name) &&
    process.env[name] &&
    process.env[name] !== 'undefined'
  )
}

function getConcurrentlyArgs(scripts, { killOthers = true } = {}) {
  const colors = [
    'bgBlue',
    'bgGreen',
    'bgMagenta',
    'bgCyan',
    'bgWhite',
    'bgRed',
    'bgBlack',
    'bgYellow',
  ]
  scripts = Object.entries(scripts).reduce((all, [name, script]) => {
    if (script) {
      all[name] = script
    }
    return all
  }, {})
  const prefixColors = Object.keys(scripts)
    .reduce(
      (pColors, _s, i) =>
        pColors.concat([`${colors[i % colors.length]}.bold.reset`]),
      []
    )
    .join(',')

  // prettier-ignore
  return [
    killOthers ? '--kill-others-on-fail' : null,
    '--prefix', '[{name}]',
    '--names', Object.keys(scripts).join(','),
    '--prefix-colors', prefixColors,
    ...Object.values(scripts).map(s => JSON.stringify(s)), // stringify escapes quotes ✨
  ].filter(Boolean)
}

function isOptedOut(key, t = true, f = false) {
  if (!fs.existsSync(fromRoot('.opt-out'))) {
    return f
  }
  const contents = fs.readFileSync(fromRoot('.opt-out'), 'utf-8')
  return contents.includes(key) ? t : f
}

function isOptedIn(key, t = true, f = false) {
  if (!fs.existsSync(fromRoot('.opt-in'))) {
    return f
  }
  const contents = fs.readFileSync(fromRoot('.opt-in'), 'utf-8')
  return contents.includes(key) ? t : f
}

function uniq(arr) {
  return Array.from(new Set(arr))
}

function writeExtraEntry(name, { cjs, esm }, clean = true) {
  if (clean) {
    rimraf.sync(fromRoot(name))
  }
  mkdirp.sync(fromRoot(name))

  const pkgJson = fromRoot(`${name}/package.json`)
  const entryDir = fromRoot(name)

  fs.writeFileSync(
    pkgJson,
    JSON.stringify(
      {
        main: path.relative(entryDir, cjs),
        'jsnext:main': path.relative(entryDir, esm),
        module: path.relative(entryDir, esm),
      },
      null,
      2
    )
  )
}

const here = p => path.join(__dirname, p)
const there = p => path.resolve(process.cwd(), p)

const tsConfigSrc = () => there('./tsconfig.json')
const hasTsConfig = () => fs.existsSync(tsConfigSrc())

const writeFileToRoot = (p, content, ...args) => {
  return fs.writeFileSync(fromRoot(p), content, ...args)
}

const isDebug = process.argv.includes('--debug')

const dlog = (args1, args2 = '') => {
  if (isDebug) {
    console.log(`[DEBUG]`, args1, args2)
  }
}

const symlink = async (target, dest) => {
  try {
    const cmd = `ln -sf ${target} ${dest}`

    if (!fs.existsSync(dest)) {
      dlog(`${dest} not found.`)
      dlog(`Creating ${dest}...`)
      mkdirp.sync(dest)
    }

    dlog('Symlinking...')
    dlog('Executing command...')
    dlog(cmd)

    exec(cmd, err => {
      if (err) {
        dlog('Symlink failed')
        return Promise.reject(err)
      } else {
        dlog('Symlink complete')
        return Promise.resolve(0)
      }
    })
  } catch (err) {
    return Promise.reject(err)
  }
}

const symlinkContents = async (target, dest) => {
  try {
    await symlink(path.join(target, '/*'), dest)
  } catch (err) {
    dlog('Symlink failed')
    return Promise.reject(err)
  }
}

module.exports = {
  appDirectory,
  dlog,
  envIsSet,
  fromRoot,
  getConcurrentlyArgs,
  hasFile,
  hasPkgProp,
  hasScript,
  hasTsConfig,
  here,
  ifAnyDep,
  ifDep,
  ifDevDep,
  ifFile,
  ifPeerDep,
  ifScript,
  isOptedIn,
  isOptedOut,
  parseEnv,
  pkg,
  resolveBin,
  resolveKcdScripts,
  symlink,
  symlinkContents,
  there,
  tsConfigSrc,
  uniq,
  writeExtraEntry,
  writeFileToRoot,
}
