const path = require('path')
const chokidar = require('chokidar')
const { debugLog, pkg } = require('../utils')
const { buildBabel } = require('./build/babel')
const { createLink } = require('./link/createLink')

let watcher

const log = (...args) => {
  const d = new Date()
  const n = `[${d.toLocaleTimeString()}]`

  // console.log(...[n, ...args])
  console.log(...args)
}

const handle = type => path => buildFile(type, path)

const buildFile = async (type, path) => {
  log('Recompiling...')

  try {
    await buildBabel({
      remapArgs: args => {
        return args.map(arg => {
          if (arg !== 'src') return arg
          return path
        })
      },
    })
    log('Compiled', path)

    if (type === 'add') {
      createLink({ verbose: false })
      log(`Updated link for ${pkg.name}`)
    }
  } catch (err) {
    log('Problem compiling', path)
  }
}

const removeFile = async path => {
  log(`Removed file...`)
  // await createLink({ verbose: false })
  // log(`Updated link for ${pkg.name}`)
}

const serve = async () => {
  log('Starting Zero module watcher')
  log()

  const cwd = process.cwd()
  const targetDir = path.join(cwd, 'src/')

  watcher = chokidar.watch(targetDir, {
    ignoreInitial: true,
  })

  log(`Watching ${targetDir}`)

  log(`Setting up link for ${pkg.name}...`)
  // await createLink({ verbose: false })

  log('\nReady!\n')

  watcher
    .on('add', handle('add'))
    .on('change', handle('change'))
    .on('unlink', removeFile)
}

serve()

process.on('SIGINT', () => {
  if (watcher && watcher.close) {
    watcher.close()
  }

  console.log('\n\nHave a great day!')
})
