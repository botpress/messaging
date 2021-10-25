import { MessagingSocket } from '@botpress/messaging-socket'
import { BoardLinker } from './linker'
import 'regenerator-runtime/runtime'

new BoardLinker(
  document.getElementById('board-linker')!,
  document.getElementById('webchat')!,
  document.getElementById('board-watcher')!
)

const test = async () => {
  const client = new MessagingSocket({
    clientId: 'd0679b50-4c7d-4afe-a10b-fc98e06e318a',
    // defaults to the cloud messaging url
    url: 'http://localhost:3100'
  })

  // TODO: this doesn't give the user info right now
  client.on('connect', (user: any) => {
    console.log('user id', user.id)
    console.log('user token', user.token)
  })

  // could be useful
  /*
  client.on('conversation', (conversation: any) => {
    console.log('message', conversation)
  })
  */

  client.on('message', (message: any) => {
    console.log('message', message)
  })

  await client.connect()

  await client.sendText('Hello there!')

  const history = await client.listMessages()
  console.log('history', history)

  console.log('getUser', await client.getUser())
  // we'll probably need this
  // await client.deleteUser()

  console.log('getConversation', await client.getConversation())
  console.log('createConversation', await client.createConversation())
  console.log('deleteConversation', await client.deleteConversation())
  console.log('listConversations', await client.listConversations())
}

void test()
