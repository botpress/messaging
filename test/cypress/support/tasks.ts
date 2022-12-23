import axios from 'axios'
import { MessagingConfig } from '../../../packages/inject/test/serve'
import { testConfig } from '../test.config'

export const sendMessage = async ({ message, conversationId }) => {
  const { data: config } = await axios.get<MessagingConfig>(`${testConfig.baseUrl}/getConfig`)

  await axios.post(
    `${config.messagingUrl}/api/v1/messages`,
    {
      authorId: undefined,
      conversationId,
      payload: {
        type: 'text',
        text: message
      }
    },
    {
      headers: {
        'x-bp-messaging-client-id': config.client.id,
        'x-bp-messaging-client-token': config.client.token
      }
    }
  )

  return null
}
