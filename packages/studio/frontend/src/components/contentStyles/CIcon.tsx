import { Icon } from '@blueprintjs/core'
import React, { FC } from 'react'

import { Carousel, Card } from './customIcons'

import { ContentIconProps } from './types'

const contentToBpIcon: any = {
  builtin_text: 'chat',
  builtin_audio: 'volume-up',
  builtin_image: 'media',
  builtin_video: 'video',
  builtin_location: 'map-marker',
  builtin_file: 'document',
  'builtin_action-button': 'stadium-geometry',
  dropdown: 'th-list',
  'builtin_single-choice': 'property'
}

const CIcon: FC<ContentIconProps> = ({ type, size, color }) => {
  switch (type) {
    case 'code':
      return <Icon icon="lightning" size={size} color={color} />
    case 'builtin_card':
      return <Card size={size} color={color} />
    case 'builtin_carousel':
      return <Carousel size={size} color={color} />
    default:
      return <Icon icon={contentToBpIcon[type]} size={size} color={color} />
  }
}

export default CIcon
