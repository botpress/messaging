import clc from 'cli-color'

const logger = {
  info: (msg: string) => console.info(`${clc.green('[INFO]')} ${msg}`),
  warning: (msg: string) => console.info(`${clc.yellow('[WARNING]')} ${msg}`),
  error: (msg: string, err?: Error | string) => console.info(`${clc.red('[ERROR]')} ${msg}`, err)
}

export default logger
