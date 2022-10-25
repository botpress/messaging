import differenceInMinutes from 'date-fns/difference_in_minutes'
import last from 'lodash/last'
import { observe } from 'mobx'
import { inject, observer } from 'mobx-react'
import React, { useEffect, useState } from 'react'
import { WrappedComponentProps, injectIntl } from 'react-intl'
import ScrollToBottom, { useScrollToBottom, useSticky } from 'react-scroll-to-bottom'

import constants from '../../core/constants'
import { RootStore, StoreDef } from '../../store'
import { Message } from '../../typings'
import Avatar from '../common/Avatar'

import MessageGroup from './MessageGroup'

interface State {
  showNewMessageIndicator: boolean
  messagesLength: number | undefined
}

class MessageList extends React.Component<MessageListProps, State> {
  private messagesDiv!: HTMLElement

  componentDidMount() {
    observe(this.props.focusedArea!, (focus) => {
      focus.newValue === 'convo' && this.messagesDiv.focus()
    })
  }

  render() {
    return (
      <ScrollToBottom
        mode={'bottom'}
        initialScrollBehavior={'auto'}
        tabIndex={0}
        className={'bpw-msg-list-scroll-container'}
        scrollViewClassName={'bpw-msg-list'}
        ref={(m: any) => {
          this.messagesDiv = m
        }}
        followButtonClassName={'bpw-msg-list-follow'}
      >
        <Content {...this.props} />
      </ScrollToBottom>
    )
  }
}

const Content = observer((props: MessageListProps) => {
  const [state, setState] = useState<State>({
    showNewMessageIndicator: false,
    messagesLength: undefined
  })
  const scrollToBottom = useScrollToBottom()
  const [sticky] = useSticky()

  useEffect(() => {
    const stateUpdate = { ...state, messagesLength: props?.currentMessages?.length }
    if (!sticky && state.messagesLength !== props?.currentMessages?.length) {
      setState({ ...stateUpdate, showNewMessageIndicator: true })
    } else {
      setState({ ...stateUpdate, showNewMessageIndicator: false })
    }
  }, [props?.currentMessages?.length, sticky])

  const shouldDisplayMessage = (m: Message): boolean => {
    return m.payload.type !== 'postback'
  }

  const renderDate = (date: Date) => {
    return (
      <div className={'bpw-date-container'}>
        {new Intl.DateTimeFormat(props.intl.locale || 'en', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric'
        }).format(new Date(date))}
        <div className={'bpw-small-line'} />
      </div>
    )
  }

  const renderAvatar = (name: string, url: string) => {
    const avatarSize = 40
    return <Avatar name={name} avatarUrl={url} height={avatarSize} width={avatarSize} />
  }

  const renderMessageGroups = () => {
    const messages = (props.currentMessages || []).filter((m: any) => shouldDisplayMessage(m))
    const groups: Message[][] = []

    let lastSpeaker: string | undefined = undefined
    let lastDate: Date | undefined = undefined
    let currentGroup: Message[] | undefined = undefined

    messages.forEach((m: any) => {
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

    if (props?.isBotTyping?.get()) {
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

          const { authorId } = last(group) as Message

          const avatar = !authorId && renderAvatar(props.botName!, props.botAvatarUrl!)

          return (
            <div key={i}>
              {isDateNeeded && renderDate(group[0].sentOn)}
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

  return (
    <>
      {state.showNewMessageIndicator && (
        <div className="bpw-new-messages-indicator" onClick={(e) => scrollToBottom()}>
          <span>
            {props.intl.formatMessage({
              id: `messages.newMessage${props?.currentMessages?.length === 1 ? '' : 's'}`
            })}
          </span>
        </div>
      )}
      {renderMessageGroups()}
    </>
  )
})

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
