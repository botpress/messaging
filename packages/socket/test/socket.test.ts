import { MessagingSocket } from '../src'

// TODO: improve this test to be more automated. Right now it requires starting
// a messaging server on port 3100 and pasting an existing client id in the CLIENT_ID variable.

const CLIENT_ID = '475dc210-0beb-4696-815f-2441b745fa4c'

describe('Socket Client', () => {
  const state: { socket?: MessagingSocket } = {}

  test('Connect', async () => {
    const socket = new MessagingSocket({
      url: 'http://localhost:3100',
      clientId: CLIENT_ID
    })

    const promise = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject('connection attempt timed out')
      }, 2500)

      socket.on('connect', () => {
        clearTimeout(timeout)
        resolve()
      })
    })

    await socket.connect({ autoLogin: false })
    await promise

    state.socket = socket
  })

  test('Login', async () => {
    const promise = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject('login attempt timed out')
      }, 2500)

      state.socket!.on('login', (creds) => {
        clearTimeout(timeout)
        resolve()
      })
    })

    await state.socket!.login()
    await promise
  })

  test('Disconnect', async () => {
    await state.socket!.disconnect()
  })
})
