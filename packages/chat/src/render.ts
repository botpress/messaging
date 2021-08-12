import { Message } from '@botpress/messaging-client'
import { WebchatEvents } from './events'
import { element, text } from './ui'
import { BotpressWebchat } from './webchat'

export class WebchatRenderer {
  private element!: HTMLDivElement
  private tbodyMessages!: HTMLTableSectionElement
  private textClientId!: Text
  private textClientToken!: Text

  constructor(private parent: HTMLElement, private webchat: BotpressWebchat) {
    this.make()
    this.listen()
  }

  private make() {
    this.makeElement()
    this.makeHeader()
    this.makeClientInfo()
    this.makeMessageTable()
    this.makeTextbox()
  }

  private makeElement() {
    this.element = element('div', this.parent)
  }

  private makeHeader() {
    element('h3', this.element, (title) => {
      text('Messaging box', title)
    })
  }

  private makeClientInfo() {
    element('ul', this.element, (ul) => {
      element('li', ul, (li) => {
        this.textClientId = text('', li)
      })
      element('li', ul, (li) => {
        this.textClientToken = text('', li)
      })
    })
  }

  private makeMessageTable() {
    element('section', this.element, (div) => {
      div.className = 'bp-messages-section'

      element('table', div, (table) => {
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
        this.tbodyMessages = element('tbody', table)
      })
    })
  }

  private makeTextbox() {
    element('p', this.element, (p) => {
      element('label', p, (label) => {
        text('Type a message', label)
      })
      element('br', p)
      element('input', p, (input) => {
        input.type = 'text'
      })
      element('button', p, (button) => {
        button.className = 'bp-send-button'

        text('Send', button)
      })
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
          text(message?.sentOn && new Date(message.sentOn).toLocaleTimeString(this.webchat.locale.current), td)
        })
      })
    }
  }
}
