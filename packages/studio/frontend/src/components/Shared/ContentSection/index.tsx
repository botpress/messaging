import cx from 'classnames'
import React, { FC } from 'react'

import * as style from './style.module.scss'
import { ContentSectionProps } from './typings'

const ContentSection: FC<ContentSectionProps> = ({ children, title, className }) => (
  <div className={cx(style.section, 'section', className)}>
    {title && <h2 className={style.sectionTitle}>{title}</h2>}
    {children}
  </div>
)

export default ContentSection
