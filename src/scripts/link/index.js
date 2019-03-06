const { createLink, referenceLink } = require('./utils')

const args = process.argv.slice(2)
const [ref] = args

const link = () => {
  if (!ref) {
    createLink()
  } else {
    referenceLink()
  }
}

link()
