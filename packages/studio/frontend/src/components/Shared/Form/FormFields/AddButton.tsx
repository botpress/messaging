import { Button } from '@blueprintjs/core'
import cx from 'classnames'
import React, { FC } from 'react'

import * as style from './style.module.scss'
import { AddButtonProps } from './typings'

const AddButton: FC<AddButtonProps> = ({ className, text, onClick }) => (
  <Button className={cx(style.addBtn, className)} minimal icon="plus" onClick={onClick} text={text} />
)

export default AddButton
