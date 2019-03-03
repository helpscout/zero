if (process.argv.includes('--browser')) {
  console.error('--browser has been deprecated, use --bundle instead')
}

const shouldBundle =
  process.argv.includes('--bundle') || process.argv.includes('--browser')

const bundle = () => {
  console.log('Compiling with Rollup...')
  require('./rollup')
}

const build = async () => {
  const { buildBabel } = require('./babel')
  const { clean } = require('./clean')

  clean()

  console.log('Compiling with Babel...')

  try {
    const result = await buildBabel()
    process.exit(result)
  } catch (err) {
    console.log(err)
    console.log('Failed to compile with Babel :(')
  }
}

if (shouldBundle) {
  bundle()
} else {
  build()
}
