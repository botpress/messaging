export type Styles = {
  label: string
  zoomLevel: string
  zoomToFit: string
  zoomWrapper: string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
