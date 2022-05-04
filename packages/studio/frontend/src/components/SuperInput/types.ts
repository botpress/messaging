import { IInputGroupProps } from '@blueprintjs/core'

export interface PanelProps {
  valid: boolean | null
  text: string
}

export enum SiTypes {
  TEMPLATE = 'template',
  EXPRESSION = 'expression',
  BOOL = 'bool'
}

export type SafeInputGroupProps = Pick<IInputGroupProps, 'leftIcon' | 'rightElement'>

export interface SiProps extends SafeInputGroupProps {
  value?: string
  onChange?: (newValue: string) => any
  placeholder?: string
  type?: SiTypes
  eventState?: any
  noGlobsEvalMsg?: string
  autoFocus?: boolean
}
