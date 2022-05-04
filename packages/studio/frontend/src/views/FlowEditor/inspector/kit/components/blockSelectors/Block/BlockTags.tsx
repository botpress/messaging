import { Tag, Icon } from '@blueprintjs/core'
import cx from 'classnames'
import React, { FC } from 'react'
import * as style from './style.module.scss'

const typeTypes: any = {
  text: 'content',
  audio: 'content',
  image: 'content',
  video: 'content',
  location: 'content',
  file: 'content',
  code: 'code',
  action_btn: 'ask',
  dropdown: 'ask',
  single_choice: 'ask',
  card: 'complex',
  carousel: 'complex'
}

export interface OwnProps {
  type: string
}

const BlockTags: FC<OwnProps> = ({ type }) => {
  const getTypeIcon = (t: string) => {
    switch (t) {
      case 'text':
        return <Icon icon="text-highlight" />
      case 'audio':
        return <Icon icon="music" />
      case 'image':
        return <Icon icon="presentation" />
      case 'video':
        return <Icon icon="video" />
      case 'location':
        return <Icon icon="geolocation" />
      case 'file':
        return <Icon icon="document" />
      case 'code':
        return <Icon icon="code" />
      case 'action_btn':
        return <Icon icon="widget-button" />
      case 'dropdown':
        return <Icon icon="multi-select" />
      case 'single_choice':
        return <Icon icon="form" />
      case 'card':
        return <Icon icon="grid-view" />
      case 'carousel':
        return <Icon icon="horizontal-distribution" />
      default:
        return <Icon icon="text-highlight" />
    }
  }

  return (
    <Tag className={cx(style.blockTag, style[typeTypes[type] || 'text'])} icon={getTypeIcon(type)}>
      {type}
    </Tag>
  )
}

export default BlockTags
