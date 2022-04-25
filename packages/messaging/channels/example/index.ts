import clc from 'cli-color'
import express, { Router } from 'express'
import { App } from './app'
import config from './config.json'

const setup = async () => {
  console.info('====================\n' + `  ${clc.magentaBright('channels example')}\n` + '====================')

  const exp = express()
  exp.get('/', (req, res) => {
    res.sendStatus(200)
  })

  const router = Router()
  const app = new App(router, config)
  await app.setup()

  const port = 3100
  exp.use('/webhooks/v1', router)
  exp.listen(port)

  console.info(`${clc.cyan('url')} ${config.externalUrl}`)
  console.info(`${clc.cyan('port')} ${port}`)
}

void setup()
