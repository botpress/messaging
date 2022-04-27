export type Styles = {
  'bp3-dark': string
  'bp3-intent-danger': string
  'bp3-intent-primary': string
  'bp3-intent-success': string
  'bp3-intent-warning': string
  'bp3-popover-appear': string
  'bp3-popover-appear-active': string
  'bp3-popover-arrow': string
  'bp3-popover-arrow-border': string
  'bp3-popover-arrow-fill': string
  'bp3-popover-content': string
  'bp3-popover-enter': string
  'bp3-popover-enter-active': string
  'bp3-popover-exit': string
  'bp3-popover-exit-active': string
  'bp3-tether-element-attached-bottom': string
  'bp3-tether-element-attached-center': string
  'bp3-tether-element-attached-left': string
  'bp3-tether-element-attached-middle': string
  'bp3-tether-element-attached-right': string
  'bp3-tether-element-attached-top': string
  'bp3-tether-target-attached-bottom': string
  'bp3-tether-target-attached-left': string
  'bp3-tether-target-attached-right': string
  'bp3-tether-target-attached-top': string
  'bp3-tooltip': string
  'bp3-tooltip-indicator': string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
