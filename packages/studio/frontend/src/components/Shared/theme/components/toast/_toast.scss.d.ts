export type Styles = {
  'bp3-button': string
  'bp3-button-group': string
  'bp3-dark': string
  'bp3-icon': string
  'bp3-intent-danger': string
  'bp3-intent-primary': string
  'bp3-intent-success': string
  'bp3-intent-warning': string
  'bp3-toast': string
  'bp3-toast-appear': string
  'bp3-toast-appear-active': string
  'bp3-toast-container': string
  'bp3-toast-container-bottom': string
  'bp3-toast-container-left': string
  'bp3-toast-container-right': string
  'bp3-toast-container-top': string
  'bp3-toast-enter': string
  'bp3-toast-enter-active': string
  'bp3-toast-exit': string
  'bp3-toast-exit-active': string
  'bp3-toast-leave-active': string
  'bp3-toast-message': string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
