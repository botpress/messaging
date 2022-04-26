import React, { FC, useEffect, useState } from 'react'
import { IntlShape } from 'react-intl'

import ThumbsDown from '../../icons/ThumbsDown'
import ThumbsUp from '../../icons/ThumbsUp'
import { EventFeedback as MessageFeedback } from '../../typings'

interface Props {
  onFeedback: (feedback: number, eventId: string) => void
  messageId: string
  messageFeedbacks: MessageFeedback[]
  intl: IntlShape
}

export const InlineFeedback: FC<Props> = ({ messageFeedbacks, messageId, onFeedback, intl }) => {
  const [feedbackSent, setFeedbackSent] = useState(false)

  useEffect(() => {
    if (messageFeedbacks && messageFeedbacks.find((x) => x.messageId === messageId && x.feedback != null)) {
      setFeedbackSent(true)
    }
  }, [messageFeedbacks])

  const handleSendFeedback = (feedback: 1 | -1) => {
    onFeedback(feedback, messageId)
    setFeedbackSent(true)
  }

  if (feedbackSent) {
    return null
  }

  return (
    <div className="bpw-message-feedback">
      <div>
        <button
          type="button"
          aria-label={intl.formatMessage({
            id: 'message.thumbsUp',
            defaultMessage: 'Thumbs Up'
          })}
          onClick={() => handleSendFeedback(1)}
        >
          <ThumbsUp />
        </button>

        <button
          type="button"
          aria-label={intl.formatMessage({
            id: 'message.thumbsDown',
            defaultMessage: 'Thumbs Down'
          })}
          onClick={() => handleSendFeedback(-1)}
        >
          <ThumbsDown />
        </button>
      </div>
    </div>
  )
}
