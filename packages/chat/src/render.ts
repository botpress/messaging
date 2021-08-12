import { Message } from '@botpress/messaging-client'
import { ConversationEvents, ConversationSetEvent } from './conversation/events'
import { WebchatEvents } from './events'
import { element, text } from './ui'
import { BotpressWebchat } from './webchat'

export class WebchatRenderer {
  private element!: HTMLDivElement
  private tbodyMessages!: HTMLTableSectionElement
  private textClientId!: Text
  private textClientToken!: Text
  private textConversationId!: Text

  constructor(private parent: HTMLElement, private webchat: BotpressWebchat) {
    this.make()
    this.listen()
  }

  private make() {
    this.makeElement()
    this.makeHeader()
    this.makeDetails()
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

  private makeDetails() {
    element('details', this.element, (details) => {
      details.open = true

      element('summary', details, (summary) => {
        text('Variables', summary)
      })
      element('ul', details, (ul) => {
        element('li', ul, (li) => {
          element('code', li, (mark) => {
            text('clientId ', mark)
          })
          this.textClientId = text('', li)
        })
        element('li', ul, (li) => {
          element('code', li, (mark) => {
            text('clientToken ', mark)
          })
          this.textClientToken = text('', li)
        })
        element('li', ul, (li) => {
          element('code', li, (mark) => {
            text('conversationId ', mark)
          })
          this.textConversationId = text('', li)
        })
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
      element('form', p, (form) => {
        form.autocomplete = 'off'

        element('label', form, (label) => {
          label.htmlFor = 'bp-message-input'
          text('Type a message', label)
        })
        element('br', form)
        element('input', form, (input) => {
          input.type = 'text'
          input.name = 'bp-message-input'

          form.onsubmit = () => {
            if (input.value.trim().length) {
              void this.webchat.postMessage(input.value.trim())
            }
            input.value = ''
            return false
          }
        })
        element('button', form, (button) => {
          button.className = 'bp-send-button'
          text('Send', button)
        })
      })
    })
  }

  private listen() {
    this.webchat.events.on(WebchatEvents.Setup, this.handleSetup.bind(this))
    this.webchat.events.on(WebchatEvents.Auth, this.handleAuth.bind(this))
    this.webchat.events.on(WebchatEvents.Messages, this.handleMessages.bind(this))
    this.webchat.conversation.events.on(ConversationEvents.Set, this.handleConversationSet.bind(this))
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

  private async handleConversationSet(e: ConversationSetEvent) {
    this.textConversationId.textContent = e.value?.id || ''
  }
}
