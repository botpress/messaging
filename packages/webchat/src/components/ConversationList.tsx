import { selectUnit } from '@formatjs/intl-utils'
import { inject, observer } from 'mobx-react'
import React from 'react'
import { WrappedComponentProps, injectIntl } from 'react-intl'

import Add from '../icons/Add'
import { RootStore, StoreDef } from '../store'
import { RecentConversation } from '../typings'

const ConversationListItem = injectIntl(({ conversation, onClick, intl }: ConversationListItemProps) => {
  const title = intl.formatMessage({ id: 'conversationList.title' }, { id: conversation.id })

  const { value, unit } = selectUnit(new Date(conversation.lastMessage?.sentOn || conversation.createdOn))
  const date = intl.formatRelativeTime(value, unit)

  const message = conversation.lastMessage?.payload?.text || '...'

  return (
    <div className={'bpw-convo-item'} onClick={onClick}>
      <div className={'bpw-align-right'}>
        <div className={'bpw-title'}>
          <div>{title}</div>
          <div className={'bpw-date'}>
            <span>{date}</span>
          </div>
        </div>
        <div className={'bpw-convo-preview'}>{message}</div>
      </div>
    </div>
  )
})

type ConversationListItemProps = {
  conversation: RecentConversation
  onClick: (event: React.MouseEvent) => void
} & WrappedComponentProps &
  Pick<StoreDef, 'conversations' | 'fetchConversation' | 'createConversation'>

class ConversationList extends React.Component<ConversationListProps> {
  private main!: HTMLElement

  componentDidMount() {
    this.main.focus()
  }

  render() {
    const { conversations, createConversation, fetchConversation } = this.props
    return (
      <div tabIndex={0} ref={(el) => (this.main = el!)} className={'bpw-convo-list'}>
        {conversations!.map((conversation, idx) => (
          <ConversationListItem
            key={conversation.id}
            conversation={conversation}
            onClick={fetchConversation!.bind(this, conversation.id)}
          />
        ))}
        <button id="btn-convo-add" className={'bpw-convo-add-btn'} onClick={createConversation!.bind(this, undefined)}>
          <Add width={15} height={15} />
        </button>
      </div>
    )
  }
}

export default inject(({ store }: { store: RootStore }) => ({
  conversations: store.conversations,
  createConversation: store.createConversation,
  fetchConversation: store.fetchConversation
}))(injectIntl(observer(ConversationList)))

type ConversationListProps = WrappedComponentProps &
  Pick<StoreDef, 'conversations' | 'fetchConversation' | 'createConversation'>
