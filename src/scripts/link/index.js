const { createLink } = require('./createLink')
const { referenceLink } = require('./referenceLink')

const args = process.argv.slice(2)
const [ref] = args

const link = () => {
  if (!ref || (ref && ref.indexOf('--') === 0)) {
    createLink()
  } else {
    referenceLink()
  }
}

link()
