const fs = require('fs')
const path = require('path')
const inquirer = require('inquirer')
const glob = require('glob')
const mkdirp = require('mkdirp')
const template = require('lodash.template')
const pkg = require('../../package.json')

const here = p => path.resolve(__dirname, p)

exports.execNew = async () => {
  console.log('Creating a new module\n')

  const pwd = process.cwd()
  const templateFiles = exports.getTemplateFiles()

  // const prompts = await inquirer.prompt([
  //   {
  //     type: 'input',
  //     name: 'module_name',
  //     message: "Module name? (Don't include @scope)",
  //   },
  //   {
  //     type: 'input',
  //     name: 'scope',
  //     message: 'Scope? (Press enter to skip)',
  //   },
  // ])

  // const answers = exports.remapPromptsToAnswers(prompts)

  const module_name = 'test'

  // Create the new directory
  const dest = path.join(pwd, module_name)
  const destSrc = path.join(dest, 'src')
  mkdirp.sync(destSrc)

  // Generating the new files
  exports.generateTemplateFiles(destSrc, { module_name: 'z', scope: null })

  // console.log(templateFiles)
}

exports.getTemplateFiles = () => {
  const templateDir = here('../templates')
  const templateFilePath = path.join(templateDir, '/**/*')
  const templateFiles = glob.sync(templateFilePath)

  return templateFiles
}

exports.getTemplateProps = rawProps => {
  const { module_name, scope } = rawProps
  const pkgName = scope ? `@${scope}/${module_name}` : module_name

  return {
    name: module_name,
    scope,
    pkgName,
    zeroVersion: pkg.version,
  }
}

exports.generateTemplateFiles = (dest, rawProps) => {
  const templateFiles = exports.getTemplateFiles()
  const props = exports.getTemplateProps(rawProps)
  const srcIndexDest = path.join(dest, 'src/index.js')

  templateFiles.forEach(file => {
    const fileContent = fs.readFileSync(file, 'utf8')
    const compiled = template(fileContent)(props)
    const templateDestBase = file.split('/templates/')[1]
    const templateDest = path.join(dest, templateDestBase)

    fs.writeFileSync(templateDest, compiled)
    console.log(`Generated ${templateDest}`)
  })

  // Crate the src/index.js file
  fs.writeFileSync(path.join(srcIndexDest, 'src/index.js'), '')
  console.log(`Generated ${srcIndexDest}`)
}

exports.remapPromptsToAnswers = prompts => {
  return Object.keys(prompts).reduce((acc, key) => {
    let value = prompts[key]
    if (key === 'scope') {
      value = value.replace('@', '')
    }
    acc[key] = value

    return acc
  }, {})
}

exports.execNew()
