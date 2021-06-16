const chalk = require('chalk')

const logger = {
  info: msg => console.log(`${chalk.green('[INFO]')} ${msg}`),
  warning: msg => console.log(`${chalk.yellow('[WARNING]')} ${msg}`),
  error: msg => console.log(`${chalk.red('[ERROR]')} ${msg}`)
}

module.exports = logger
