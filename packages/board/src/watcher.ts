import { Webchat, ConversationEvents, ConversationSetEvent, UserEvents, UserSetEvent } from './chat'
import { text, element } from './skin'

export class BoardWatcher {
  private textUserId!: Text
  private textUserToken!: Text
  private textConversationId!: Text

  constructor(private parent: HTMLElement, private webchat: Webchat) {
    this.make()
    this.listen()
  }

  private make() {
    element('details', this.parent, (details) => {
      details.open = true

      element('summary', details, (summary) => {
        text('Variables', summary)
      })
      element('ul', details, (ul) => {
        element('li', ul, (li) => {
          element('code', li, (code) => {
            text('clientId ', code)
          })
          text(this.webchat.socket.clientId, li)
        })
        element('li', ul, (li) => {
          element('code', li, (code) => {
            text('userId ', code)
          })
          this.textUserId = text('', li)
        })
        element('li', ul, (li) => {
          element('code', li, (code) => {
            text('userToken ', code)
          })
          this.textUserToken = text('', li)
        })
        element('li', ul, (li) => {
          element('code', li, (code) => {
            text('conversationId ', code)
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
    this.textUserId.textContent = e.value?.userId || ''
    this.textUserToken.textContent = e.value?.userToken || ''
  }

  private async handleConversationSet(e: ConversationSetEvent) {
    this.textConversationId.textContent = e.value?.id || ''
  }
}
