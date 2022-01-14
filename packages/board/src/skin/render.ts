import { Message } from '@botpress/messaging-base'
import { Webchat, MessagesEvents } from '../chat'
import lang from './lang'
import { element, text } from './ui'

export class WebchatRenderer {
  private sectionMessage!: HTMLElement
  private tbodyMessages!: HTMLTableSectionElement

  constructor(private parent: HTMLElement, private webchat: Webchat) {
    this.make()
    this.listen()
  }

  private make() {
    this.webchat.lang.extend(lang)

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
          text(this.webchat.lang.tr('webchat.typeMessage'), label)
        })
        element('br', form)
        element('input', form, (input) => {
          input.type = 'text'
          input.name = 'bp-message-input'

          form.onsubmit = (e) => {
            e.preventDefault()

            if (input.value.trim().length) {
              void this.webchat.messages.send(input.value.trim())
            }
            input.value = ''
            return false
          }
        })
        element('button', form, (button) => {
          button.className = 'bp-send-button'
          text(this.webchat.lang.tr('webchat.send'), button)
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
          text(this.webchat.lang.date(message?.sentOn), td)
        })
      })
    }

    this.sectionMessage?.scrollTo(0, this.sectionMessage.scrollHeight)
  }

  private async handleSend(content: any) {
    this.sectionMessage?.scrollTo(0, this.sectionMessage.scrollHeight)
  }
}
