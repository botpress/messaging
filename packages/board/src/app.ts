import { MessagingClient } from '@botpress/messaging-client'
import { BotpressWebchat } from '@botpress/webchat'
import { WebchatRenderer } from '@botpress/webchat-skin'
import { BoardRenderer } from './render'

const setup = async () => {
  // We assume the messaging server is started in localhost
  const url = 'http://localhost:3100'

  const client = new MessagingClient({ url })

  let clientCreds: any = localStorage.getItem('bp-board-client')!
  clientCreds = JSON.parse(clientCreds)

  const res = await client.syncs.sync(clientCreds)
  clientCreds = { id: res.id, token: res.token }

  localStorage.setItem('bp-board-client', JSON.stringify(clientCreds))

  const webchat = new BotpressWebchat(url, clientCreds.id)
  new BoardRenderer(document.getElementById('board-debug')!, webchat)
  new WebchatRenderer(document.getElementById('webchat')!, webchat)

  await webchat.setup()
}

void setup()
