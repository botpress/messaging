import axios from 'axios'
import express from 'express'
import fs from 'fs'
import path from 'path'

export interface MessagingConfig {
  client: {
    id: string
    token: string
  }
  messagingUrl: string
}

const messagingUrl = process.env.MESSAGING_ENDPOINT || 'http://localhost:3100'

const getMessagingClient = async () => {
  try {
    const { data } = await axios.post(`${messagingUrl}/api/v1/admin/clients`, null, {
      headers: { ['x-bp-messaging-admin-key']: 'abc123' }
    })
    return data
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.warn('Messaging must be running first.', err.message)
      process.exit(1)
    }
  }
}

const startServer = async () => {
  const app = express()
  const client = await getMessagingClient()

  app.get<MessagingConfig>('/getConfig', async (req, res) => {
    res.json({ client, messagingUrl })
  })

  // this is the webchat page real users uses in production
  app.get('/webchat.html', async (req, res) => {
    const file = fs.readFileSync(path.resolve(__dirname, './webchat.html'))
    const html = file
      .toString()
      .replace('MESSAGING_URL', messagingUrl)
      .replace(/HOST_URL/g, 'http://localhost:3700')
      .replace('CLIENT_ID', client.id || 'none')

    res.send(html)
  })

  app.use(express.static(path.resolve(__dirname, '../dist')))

  app.listen(3700, () => {
    console.info('Serving webchat at http://localhost:3700/webchat.html')
  })
}

void startServer()
