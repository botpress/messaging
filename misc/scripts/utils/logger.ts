import chalk from 'chalk'

const logger = {
  info: (msg: string) => console.info(`${chalk.green('[INFO]')} ${msg}`),
  warning: (msg: string) => console.info(`${chalk.yellow('[WARNING]')} ${msg}`),
  error: (msg: string, err?: Error | string) => console.info(`${chalk.red('[ERROR]')} ${msg}`, err)
}

export default logger
