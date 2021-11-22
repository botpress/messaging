import React from 'react'
import { MessageTypeHandlerProps } from '../typings'

export const TypingIndicator: React.FC<MessageTypeHandlerProps<'typing'>> = () => (
  <div className={'bpw-typing-group'}>
    <div className={'bpw-typing-bubble'} />
    <div className={'bpw-typing-bubble'} />
    <div className={'bpw-typing-bubble'} />
  </div>
)
