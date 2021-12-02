import clc from 'cli-color'
import express from 'express'
import { TelegramChannel } from '../src/telegram/channel'
import config from './config.json'

console.info('====================\n' + `  ${clc.magentaBright('channels example')}\n` + '====================\n')

const app = express()

app.get('/', (req, res) => {
  res.sendStatus(200)
})

const setup = async () => {
  const telegram = new TelegramChannel()
  await telegram.setup(app)

  telegram.on('message', async (e) => {
    console.info('message!', e)
    await telegram.send(e.scope, e.endpoint, { text: 'yoyo' })
  })

  for (const [key, val] of Object.entries(config)) {
    await telegram.start(key, val)
    console.info(clc.blue('conf'), clc.greenBright(key), val)
  }

  const port = 3100
  app.listen(port)
  console.info(`\n${clc.blue('listening')} http://localhost:${clc.cyan(port)}`)
}

void setup()
