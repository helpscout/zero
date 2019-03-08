const { createLink, referenceLink } = require('./utils')

const args = process.argv.slice(2)
const [ref] = args

const link = () => {
  // TODO: Make this debug flag better
  if (!ref || ref === '--debug') {
    createLink()
  } else {
    referenceLink()
  }
}

link()
