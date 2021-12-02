import express from 'express'
import { TelegramChannel } from '../src/telegram/channel'

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

  await telegram.start('gggg', { botToken: 'YOUR_CONFIG' })

  app.listen(3100)
  console.info('Channels example listening at : http://localhost:3100')
}

void setup()
