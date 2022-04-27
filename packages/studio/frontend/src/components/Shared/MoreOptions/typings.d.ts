import { IconName } from '@blueprintjs/icons'

export interface MoreOptionsProps extends MoreOptionsMenuProps {
  show: boolean
  onToggle: (value: boolean) => void
  children?: any
  element?: JSX.Element
  wrapInDiv?: boolean
}

export interface MoreOptionsMenuProps {
  items: MoreOptionsItems[]
  onToggle: (value: boolean) => void
  className?: string
}

export interface MoreOptionsItems {
  icon?: IconName
  label: string
  className?: string
  selected?: boolean
  content?: JSX.Element
  action?: () => void
  type?: 'delete' | 'convert'
}
