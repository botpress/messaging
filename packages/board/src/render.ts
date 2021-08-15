import { Webchat, ConversationEvents, ConversationSetEvent } from '@botpress/webchat'
import { text, element } from '@botpress/webchat-skin'
import { UserEvents, UserSetEvent } from '@botpress/webchat/src/user/events'

export class BoardRenderer {
  private textUserId!: Text
  private textConversationId!: Text

  constructor(private parent: HTMLElement, private webchat: Webchat) {
    this.make()
    this.listen()
  }

  private make() {
    element('h3', this.parent, (title) => {
      text('Messaging box', title)
    })
    element('details', this.parent, (details) => {
      details.open = true

      element('summary', details, (summary) => {
        text('Variables', summary)
      })
      element('ul', details, (ul) => {
        element('li', ul, (li) => {
          element('code', li, (mark) => {
            text('clientId ', mark)
          })
          text(this.webchat.socket.clientId, li)
        })
        element('li', ul, (li) => {
          element('code', li, (mark) => {
            text('userId ', mark)
          })
          this.textUserId = text('', li)
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

  private listen() {
    this.webchat.user.events.on(UserEvents.Set, this.handleUserSet.bind(this))
    this.webchat.conversation.events.on(ConversationEvents.Set, this.handleConversationSet.bind(this))
  }

  private async handleUserSet(e: UserSetEvent) {
    this.textUserId.textContent = e.value?.id || ''
  }

  private async handleConversationSet(e: ConversationSetEvent) {
    this.textConversationId.textContent = e.value?.id || ''
  }
}
