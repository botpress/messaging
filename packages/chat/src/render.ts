import { Message } from '@botpress/messaging-client'
import { WebchatEvents } from './events'
import { element, text } from './ui'
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
    element('h3', this.root, (title) => {
      text('Messaging box', title)
    })
  }

  private makeClientInfo() {
    element('ul', this.root, (ul) => {
      element('li', ul, (li) => {
        this.textClientId = text('', li).assignTo(this.textClientId)
      })
      element('li', ul, (li) => {
        this.textClientToken = text('', li).assignTo(this.textClientToken)
      })
    })
  }

  private makeMessageTable() {
    element('table', this.root, (table) => {
      element('thead', table, (thead) => {
        element('tr', thead, (tr) => {
          element('th', tr, (th) => {
            text('type', th)
          })
          element('th', tr, (th) => {
            text('text', th)
          })
          element('th', tr, (th) => {
            text('time', th)
          })
        })
      })

      this.tbodyMessages = element('tbody', table).assignTo(this.tbodyMessages)
    })
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
      element('tr', this.tbodyMessages, (tr) => {
        element('td', tr, (td) => {
          text(message?.payload?.type, td)
        })
        element('td', tr, (td) => {
          text(message?.payload?.text, td)
        })
        element('td', tr, (td) => {
          text(new Date(message?.sentOn)?.toLocaleTimeString(this.webchat.locale.current), td)
        })
      })
    }
  }
}
