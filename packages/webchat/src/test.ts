import { MessagingSocket } from '@botpress/messaging-socket'

const socket = new MessagingSocket({ url: 'yo', clientId: 'yo' })

console.log('this is the webchat!', socket)
