import { BotpressWebchat, ConversationEvents, ConversationSetEvent, WebchatEvents } from '@botpress/webchat'
import { text, element } from '@botpress/webchat-skin'

export class BoardRenderer {
  private textClientId!: Text
  private textClientToken!: Text
  private textConversationId!: Text

  constructor(private parent: HTMLElement, private webchat: BotpressWebchat) {
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

  private listen() {
    this.webchat.events.on(WebchatEvents.Setup, this.handleSetup.bind(this))
    this.webchat.events.on(WebchatEvents.Auth, this.handleAuth.bind(this))
    this.webchat.conversation.events.on(ConversationEvents.Set, this.handleConversationSet.bind(this))
  }

  private async handleSetup() {}

  private async handleAuth() {
    this.textClientId.textContent = this.webchat.auth!.clientId
    this.textClientToken.textContent = this.webchat.auth!.clientToken
  }

  private async handleConversationSet(e: ConversationSetEvent) {
    this.textConversationId.textContent = e.value?.id || ''
  }
}
