const { createLink, referenceLink } = require('./utils')

const args = process.argv.slice(2)
const [ref] = args

const link = () => {
  if (!ref || ref.indexOf('--') <= 0) {
    createLink()
  } else {
    referenceLink()
  }
}

link()
