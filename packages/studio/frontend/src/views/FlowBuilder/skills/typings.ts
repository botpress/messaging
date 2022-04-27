// These are properties provided by the studio
export interface SkillProps<T> {
  initialData: T
  onDataChanged: (data: T) => void
  onValidChanged: (canSubmit: boolean) => void
  resizeBuilderWindow: (newSize: 'normal' | 'large' | 'small') => void
  contentLang: string
  defaultLanguage: string
  languages: string[]
}

export enum NodeActionType { // TODO: clean this.. we can't use Enum from the SDK as we only export definitions
  RenderElement = 'render',
  RunAction = 'run',
  RenderText = 'say'
}
