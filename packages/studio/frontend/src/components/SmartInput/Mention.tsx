import cx from 'classnames'
import React from 'react'

const MentionText = ({ children, className, entityKey, mention, theme, decoratedText }) => (
  <span className={className} spellCheck={false}>
    {children}
  </span>
)

const Mention = (props) => {
  const { entityKey, theme = {}, children, decoratedText, className, contentState } = props

  const combinedClassName = cx(theme.mention, className)
  const mention = contentState.getEntity(entityKey).getData().mention
  const Component = MentionText

  return (
    <Component
      entityKey={entityKey}
      mention={mention}
      theme={theme}
      className={combinedClassName}
      decoratedText={decoratedText}
    >
      {children}
    </Component>
  )
}

export default Mention
