import { Message } from '@botpress/messaging-client'
import { Webchat, MessagesEvents } from '@botpress/webchat'
import { element, text } from './ui'

export class WebchatRenderer {
  private sectionMessage!: HTMLElement
  private tbodyMessages!: HTMLTableSectionElement

  constructor(private parent: HTMLElement, private webchat: Webchat) {
    this.make()
    this.listen()
  }

  private make() {
    element('div', this.parent, (div) => {
      this.makeMessageTable(div)
      this.makeTextbox(div)
    })
  }

  private makeMessageTable(parent: Node) {
    return element('section', parent, (section) => {
      this.sectionMessage = section
      section.className = 'bp-messages-section'

      element('table', section, (table) => {
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

  private makeTextbox(parent: Node) {
    return element('p', parent, (p) => {
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
              void this.webchat.messages.send(input.value.trim())
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
    this.webchat.messages.events.on(MessagesEvents.Receive, this.handleReceive.bind(this))
    this.webchat.messages.events.on(MessagesEvents.Send, this.handleSend.bind(this))
  }

  private async handleReceive(messages: Message[]) {
    for (const message of messages) {
      if (message?.payload?.type === 'typing') {
        continue
      }

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

    this.sectionMessage?.scrollTo(0, this.sectionMessage.scrollHeight)
  }

  private async handleSend(content: any) {
    this.sectionMessage?.scrollTo(0, this.sectionMessage.scrollHeight)
  }
}
