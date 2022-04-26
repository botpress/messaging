import { IconName } from '@blueprintjs/core'
import React from 'react'
import { MoreOptionsItems } from '../../MoreOptions/typings'
import { Tab } from '../../Tabs/typings'

export interface ToolbarProps {
  tabs?: Tab[]
  tabChange?: (tab: string) => void
  currentTab?: string
  buttons?: ToolbarButtonProps[]
  rightContent?: React.ReactElement
  className?: string
}

export interface ToolbarButtonProps {
  id?: string
  onClick?: () => void
  icon?: IconName
  optionsWrapperClassName?: string
  content?: React.ReactElement // Allow to add custom fonctionality to a button (like adding an input in front of it)
  optionsItems?: MoreOptionsItems[]
  disabled?: boolean
  tooltip?: string
}
