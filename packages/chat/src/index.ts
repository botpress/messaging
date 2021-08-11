import { MessagingClient } from '@botpress/messaging-client'

export class BotpressWebchat {
  public client!: MessagingClient
  private clientId!: string
  private clientToken!: string

  constructor(private url: string, private root: HTMLElement) {}

  async setup() {
    // eslint-disable-next-line no-console
    console.log('This is the botpress webchat!')

    const syncClient = new MessagingClient({ url: this.url })

    const { id, token } = await syncClient.syncs.sync({ channels: {} })

    this.clientId = id
    this.clientToken = token
    this.client = new MessagingClient({ url: this.url, auth: { clientId: id, clientToken: token } })

    await this.draw()
  }

  async draw() {
    const title = document.createElement('h3')
    {
      const titleText = document.createTextNode('Messaging box')
      title.appendChild(titleText)
    }
    this.root.appendChild(title)

    const ul = document.createElement('ul')
    {
      const liClientId = document.createElement('li')
      {
        const textClientId = document.createTextNode(this.clientId)
        liClientId.appendChild(textClientId)
      }
      ul.appendChild(liClientId)

      const liToken = document.createElement('li')
      {
        const textToken = document.createTextNode(this.clientToken)
        liToken.appendChild(textToken)
      }
      ul.appendChild(liToken)
    }
    this.root.appendChild(ul)
  }
}
