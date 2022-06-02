import { Tag, TagProps } from '@blueprintjs/core'
import React, { FC } from 'react'

import CIcon from '../CIcon'

interface OwnProps extends TagProps {
  label?: string
  type: string
}

const CTag: FC<OwnProps> = (props) => {
  const { type, label } = props

  return (
    <Tag icon={<CIcon type={type} />} {...props}>
      {label}
    </Tag>
  )
}

export default CTag
