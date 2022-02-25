import { ResizeObserver } from '@juggle/resize-observer'
import differenceInMinutes from 'date-fns/difference_in_minutes'
import debounce from 'lodash/debounce'
import { observe } from 'mobx'
import { inject, observer } from 'mobx-react'
import React from 'react'
import { WrappedComponentProps, injectIntl } from 'react-intl'

import constants from '../../core/constants'
import { RootStore, StoreDef } from '../../store'
import { Message } from '../../typings'
import Avatar from '../common/Avatar'

import MessageGroup from './MessageGroup'

interface State {
  manualScroll: boolean
  showNewMessageIndicator: boolean
}

class MessageList extends React.Component<MessageListProps, State> {
  private messagesDiv!: HTMLElement
  private divSizeObserver!: ResizeObserver
  state: State = { showNewMessageIndicator: false, manualScroll: false }

  componentDidMount() {
    this.tryScrollToBottom(true)

    observe(this.props.focusedArea!, (focus) => {
      focus.newValue === 'convo' && this.messagesDiv.focus()
    })

    if (this.props.currentMessages) {
      observe(this.props.currentMessages, (messages) => {
        if (this.state.manualScroll) {
          if (!this.state.showNewMessageIndicator) {
            this.setState({ showNewMessageIndicator: true })
          }
          return
        }
        this.tryScrollToBottom()
      })
    }

    // this should account for keyboard rendering as it triggers a resize of the messagesDiv
    this.divSizeObserver = new ResizeObserver(
      debounce(
        (_divResizeEntry) => {
          // we don't need to do anything with the resize entry
          this.tryScrollToBottom()
        },
        200,
        { trailing: true }
      )
    )
    this.divSizeObserver.observe(this.messagesDiv)
  }

  componentWillUnmount() {
    this.divSizeObserver.disconnect()
  }

  componentDidUpdate() {
    if (this.state.manualScroll) {
      return
    }
    this.tryScrollToBottom()
  }

  tryScrollToBottom(delayed?: boolean) {
    setTimeout(
      () => {
        try {
          this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight
        } catch (err) {
          // Discard the error
        }
      },
      delayed ? 250 : 0
    )
  }

  renderDate(date: Date) {
    return (
      <div className={'bpw-date-container'}>
        {new Intl.DateTimeFormat(this.props.intl.locale || 'en', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric'
        }).format(new Date(date))}
        <div className={'bpw-small-line'} />
      </div>
    )
  }

  renderAvatar(name: string, url: string) {
    const avatarSize = 40
    return <Avatar name={name} avatarUrl={url} height={avatarSize} width={avatarSize} />
  }

  renderMessageGroups() {
    const messages = (this.props.currentMessages || []).filter((m) => this.shouldDisplayMessage(m))
    const groups: Message[][] = []

    let lastSpeaker: string | undefined = undefined
    let lastDate: Date | undefined = undefined
    let currentGroup: Message[] | undefined = undefined

    messages.forEach((m) => {
      const speaker = m.authorId
      const date = m.sentOn

      // Create a new group if messages are separated by more than X minutes or if different speaker
      if (
        speaker !== lastSpeaker ||
        !currentGroup ||
        differenceInMinutes(new Date(date), new Date(lastDate!)) >= constants.TIME_BETWEEN_DATES
      ) {
        currentGroup = []
        groups.push(currentGroup)
      }

      if (currentGroup.find((x) => x.id === m.id)) {
        return
      }
      currentGroup.push(m)

      lastSpeaker = speaker
      lastDate = date
    })

    if (this.props.isBotTyping!.get()) {
      if (lastSpeaker !== 'bot') {
        currentGroup = []
        groups.push(currentGroup)
      }

      currentGroup!.push({
        sentOn: new Date(),
        payload: { type: 'typing' }
      } as any)
    }
    return (
      <div>
        {groups.map((group, i) => {
          const lastGroup = groups[i - 1]
          const lastDate = lastGroup?.[lastGroup.length - 1]?.sentOn
          const groupDate = group?.[0].sentOn

          const isDateNeeded =
            !groups[i - 1] ||
            differenceInMinutes(new Date(groupDate), new Date(lastDate)) > constants.TIME_BETWEEN_DATES

          const [{ authorId }] = group

          const avatar = !authorId && this.renderAvatar(this.props.botName!, this.props.botAvatarUrl!)

          return (
            <div key={i}>
              {isDateNeeded && this.renderDate(group[0].sentOn)}
              <MessageGroup
                isBot={!authorId}
                avatar={avatar as JSX.Element}
                key={`msg-group-${i}`}
                isLastGroup={i >= groups.length - 1}
                messages={group}
              />
            </div>
          )
        })}
      </div>
    )
  }

  shouldDisplayMessage = (m: Message): boolean => {
    return m.payload.type !== 'postback'
  }

  handleScroll = debounce((e) => {
    const scroll = this.messagesDiv.scrollHeight - this.messagesDiv.scrollTop - this.messagesDiv.clientHeight
    const manualScroll = scroll >= 150
    const showNewMessageIndicator = this.state.showNewMessageIndicator && manualScroll

    this.setState({ manualScroll, showNewMessageIndicator })
  }, 50)

  render() {
    return (
      <div
        tabIndex={0}
        className={'bpw-msg-list'}
        ref={(m) => {
          this.messagesDiv = m!
        }}
        onScroll={this.handleScroll}
      >
        {this.state.showNewMessageIndicator && (
          <div className="bpw-new-messages-indicator" onClick={(e) => this.tryScrollToBottom()}>
            <span>
              {this.props.intl.formatMessage({
                id: `messages.newMessage${this.props.currentMessages!.length === 1 ? '' : 's'}`
              })}
            </span>
          </div>
        )}
        {this.renderMessageGroups()}
      </div>
    )
  }
}

export default inject(({ store }: { store: RootStore }) => ({
  intl: store.intl,
  botName: store.botName,
  isBotTyping: store.isBotTyping,
  botAvatarUrl: store.botAvatarUrl,
  currentMessages: store.currentMessages,
  focusPrevious: store.view.focusPrevious,
  focusNext: store.view.focusNext,
  focusedArea: store.view.focusedArea,
  preferredLanguage: store.preferredLanguage
}))(injectIntl(observer(MessageList)))

type MessageListProps = WrappedComponentProps &
  Pick<
    StoreDef,
    | 'intl'
    | 'isBotTyping'
    | 'focusedArea'
    | 'focusPrevious'
    | 'focusNext'
    | 'botAvatarUrl'
    | 'botName'
    | 'currentMessages'
    | 'preferredLanguage'
  >
