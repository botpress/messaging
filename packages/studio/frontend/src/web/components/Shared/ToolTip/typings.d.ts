export interface ToolTipProps {
  hoverOpenDelay?: number
  children?: React.ReactNode
  content: string | JSX.Element | undefined
  position?: string
  childId?: string
  className?: string
}
