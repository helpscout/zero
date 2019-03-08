const path = require('path')
const spawn = require('cross-spawn')
const { hasPkgProp, resolveBin, hasFile } = require('../../utils')

const args = process.argv.slice(2)
const here = p => path.join(__dirname, p)

const defaultOptions = {
  remapArgs: args => args,
  stdio: 'inherit',
}

exports.buildBabel = async (options = {}) => {
  const { remapArgs, stdio } = { ...defaultOptions, ...options }

  try {
    const useBuiltinConfig =
      !args.includes('--presets') &&
      !hasFile('.babelrc') &&
      !hasFile('.babelrc.js') &&
      !hasFile('babel.config.js') &&
      !hasPkgProp('babel')

    const config = useBuiltinConfig
      ? ['--presets', here('../../config/babelrc.js')]
      : []

    const ignore = args.includes('--include')
      ? []
      : ['--ignore', '__tests__,__mocks__']

    const copyFiles = args.includes('--no-copy-files') ? [] : ['--copy-files']

    const useSpecifiedOutDir = args.includes('--out-dir')
    const outDir = useSpecifiedOutDir ? [] : ['--out-dir', 'dist']

    // Add TypeScript support!
    const extensions = args.includes('--extensions')
      ? []
      : ['--extensions', '.js,.jsx,.ts,.tsx']

    const babelArgs = [
      ...outDir,
      ...copyFiles,
      ...ignore,
      ...config,
      ...extensions,
      'src',
    ].concat(args)

    const remappedArgs = remapArgs(babelArgs)
    const babelExecArgs = Array.isArray(remappedArgs) ? remappedArgs : babelArgs

    const result = spawn.sync(
      resolveBin('@babel/cli', { executable: 'babel' }),
      babelExecArgs,
      { stdio }
    )

    if (result.status) {
      return Promise.reject(1)
    } else {
      return Promise.resolve(0)
    }
  } catch (err) {
    console.log(err)
    return Promise.reject(1)
  }
}
