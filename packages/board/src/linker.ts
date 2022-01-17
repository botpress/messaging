import { MessagingChannel } from '@botpress/messaging-client'
import { ConversationEvents, UserEvents, Webchat } from './chat'
import { text, element, WebchatRenderer } from './skin'
import { BoardWatcher } from './watcher'

export class BoardLinker {
  private inputHost!: HTMLInputElement
  private inputClientId!: HTMLInputElement
  private inputUserId!: HTMLInputElement
  private inputUserToken!: HTMLInputElement
  private inputConversationId!: HTMLInputElement

  private webchat?: Webchat

  constructor(private parent: HTMLElement, private webchatElement: HTMLElement, private watcherElement: HTMLElement) {
    this.make()
    this.listen()
    void this.create()
  }

  private make() {
    element('h3', this.parent, (title) => {
      text('Messaging box', title)
    })
    element('details', this.parent, (details) => {
      element('summary', details, (summary) => {
        text('Link', summary)
      })
      element('form', details, (form) => {
        form.autocomplete = 'off'

        element('label', form, (label) => {
          label.htmlFor = 'bp-host-input'
          text('host', label)
        })
        element('br', form)
        this.inputHost = element('input', form, (input) => {
          input.type = 'text'
          input.name = 'bp-host-input'
        })
        element('br', form)
        element('label', form, (label) => {
          label.htmlFor = 'bp-clientId-input'
          text('clientId', label)
        })
        element('br', form)
        this.inputClientId = element('input', form, (input) => {
          input.type = 'text'
          input.name = 'bp-clientId-input'
        })
        element('br', form)
        element('label', form, (label) => {
          label.htmlFor = 'bp-userId-input'
          text('userId', label)
        })
        element('br', form)
        this.inputUserId = element('input', form, (input) => {
          input.type = 'text'
          input.name = 'bp-userId-input'
        })
        element('br', form)
        element('label', form, (label) => {
          label.htmlFor = 'bp-userToken-input'
          text('userToken', label)
        })
        element('br', form)
        this.inputUserToken = element('input', form, (input) => {
          input.type = 'text'
          input.name = 'bp-userToken-input'
        })
        element('br', form)
        element('label', form, (label) => {
          label.htmlFor = 'bp-conversationId-input'
          text('conversationId', label)
        })
        element('br', form)
        this.inputConversationId = element('input', form, (input) => {
          input.type = 'text'
          input.name = 'bp-conversationId-input'
        })
        element('br', form)
        element('button', form, (button) => {
          text('Link', button)
        })

        form.onsubmit = (e) => {
          e.preventDefault()
          void this.create()
          return false
        }
      })
    })
  }

  private listen() {}

  private async create() {
    await this.webchat?.destroy()

    let host = this.inputHost.value
    if (!host?.length) {
      host = localStorage.getItem('bp-host') || 'http://localhost:3100'
    }

    let clientId = this.inputClientId.value
    if (!clientId?.length) {
      clientId = localStorage.getItem('bp-board-client')!
    }
    if (!clientId?.length) {
      const client = new MessagingChannel({ url: host })
      const res = await client.sync({})
      clientId = res.id
    }

    while (this.watcherElement.firstChild) {
      this.watcherElement.removeChild(this.watcherElement.lastChild!)
    }
    while (this.webchatElement.firstChild) {
      this.webchatElement.removeChild(this.webchatElement.lastChild!)
    }

    this.webchat = new Webchat(host, clientId)
    new WebchatRenderer(this.webchatElement, this.webchat)
    new BoardWatcher(this.watcherElement, this.webchat)

    if (this.inputUserId.value.length) {
      this.webchat.user.events.on(UserEvents.Choose, async (e) => {
        if (!e.choice) {
          e.choice = <any>{}
        }
        e.choice!.userId = this.inputUserId.value
      })
    }
    if (this.inputUserToken.value.length) {
      this.webchat.user.events.on(UserEvents.Choose, async (e) => {
        if (!e.choice) {
          e.choice = <any>{}
        }
        e.choice!.userToken = this.inputUserToken.value
      })
    }
    if (this.inputConversationId.value.length) {
      this.webchat.conversation.events.on(ConversationEvents.Choose, async (e) => {
        e.choice = this.inputConversationId.value
      })
    }

    this.webchat.socket.on('connect', async () => {
      localStorage.setItem('bp-host', host)
      this.inputHost.placeholder = host
      this.inputHost.value = ''
    })

    this.inputClientId.placeholder = clientId
    this.webchat.user.events.on(UserEvents.Set, async (e) => {
      localStorage.setItem('bp-board-client', clientId)
      this.inputUserId.placeholder = e.value?.userId || ''
      this.inputUserId.value = ''

      this.inputUserToken.placeholder = e.value?.userToken || ''
      this.inputUserToken.value = ''
    })
    this.webchat.conversation.events.on(ConversationEvents.Set, async (e) => {
      this.inputConversationId.placeholder = e.value?.id || ''
      this.inputConversationId.value = ''
    })

    void this.webchat.setup()
  }
}
