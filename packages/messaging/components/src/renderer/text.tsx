import React from 'react'
import ReactTextFormat from 'react-text-format'
import { MessageTypeHandlerProps } from '../typings'
import { renderUnsafeHTML } from '../utils'

export const Text: React.FC<MessageTypeHandlerProps<'text'>> = ({ text, markdown, config }) => {
  const { escapeHTML } = config

  let message: React.ReactNode
  if (markdown) {
    const html = renderUnsafeHTML(text, escapeHTML)
    message = <div dangerouslySetInnerHTML={{ __html: html }} />
  } else {
    message = <p>{text}</p>
  }

  return (
    <ReactTextFormat linkTarget={'_blank'}>
      <div>{message}</div>
    </ReactTextFormat>
  )
}
