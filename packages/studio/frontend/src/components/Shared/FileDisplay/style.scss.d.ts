export type Styles = {
  audioWrapper: string
  audioWrapperActions: string
  audioWrapperSource: string
  deleteFile: string
  fileWrapper: string
  fileWrapperActions: string
  fileWrapperFile: string
  imageWrapper: string
  imageWrapperActions: string
  videoWrapper: string
  videoWrapperActions: string
  videoWrapperSource: string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
