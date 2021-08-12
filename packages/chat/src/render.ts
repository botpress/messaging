import { Message } from '@botpress/messaging-client'
import { WebchatEvents } from './events'
import { BotpressWebchat } from './webchat'

export class WebchatRenderer {
  private tbodyMessages!: HTMLTableSectionElement
  private textClientId!: Text
  private textClientToken!: Text

  constructor(private root: HTMLElement, private webchat: BotpressWebchat) {
    this.make()
    this.listen()
  }

  private make() {
    this.makeHeader()
    this.makeClientInfo()
    this.makeMessageTable()
  }

  private makeHeader() {
    const title = document.createElement('h3')
    {
      const titleText = document.createTextNode('Messaging box')
      title.appendChild(titleText)
    }
    this.root.appendChild(title)
  }

  private makeClientInfo() {
    const ul = document.createElement('ul')
    {
      const liClientId = document.createElement('li')
      {
        this.textClientId = document.createTextNode('')
        liClientId.appendChild(this.textClientId)
      }
      ul.appendChild(liClientId)

      const liToken = document.createElement('li')
      {
        this.textClientToken = document.createTextNode('')
        liToken.appendChild(this.textClientToken)
      }
      ul.appendChild(liToken)
    }
    this.root.appendChild(ul)
  }

  private makeMessageTable() {
    const table = document.createElement('table')
    {
      const thead = document.createElement('thead')
      {
        const tr = document.createElement('tr')
        {
          const thType = document.createElement('th')
          {
            const thTypeText = document.createTextNode('type')
            thType.appendChild(thTypeText)
          }
          tr.appendChild(thType)

          const thText = document.createElement('th')
          {
            const thTextText = document.createTextNode('text')
            thText.appendChild(thTextText)
          }
          tr.appendChild(thText)
        }
        thead.appendChild(tr)
      }
      table.appendChild(thead)

      this.tbodyMessages = document.createElement('tbody')
      table.appendChild(this.tbodyMessages)
    }
    this.root.appendChild(table)
  }

  private listen() {
    this.webchat.events.on(WebchatEvents.Setup, this.handleSetup.bind(this))
    this.webchat.events.on(WebchatEvents.Auth, this.handleAuth.bind(this))
    this.webchat.events.on(WebchatEvents.Messages, this.handleMessages.bind(this))
  }

  private async handleSetup() {}

  private async handleAuth() {
    this.textClientId.textContent = this.webchat.auth!.clientId
    this.textClientToken.textContent = this.webchat.auth!.clientToken
  }

  private async handleMessages(messages: Message[]) {
    for (const message of messages) {
      const tr = document.createElement('tr')
      {
        const tdType = document.createElement('td')
        {
          const tdTypeText = document.createTextNode(message?.payload?.type)
          tdType.appendChild(tdTypeText)
        }
        tr.appendChild(tdType)

        const tdText = document.createElement('td')
        {
          const tdTextText = document.createTextNode(message?.payload?.text)
          tdText.appendChild(tdTextText)
        }
        tr.appendChild(tdText)
      }
      this.tbodyMessages.appendChild(tr)
    }
  }
}
