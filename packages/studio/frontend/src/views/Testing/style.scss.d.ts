export type Styles = {
  'actions-container': string
  botReplies: string
  empty: string
  interaction: string
  interactionStatus: string
  reportInteractions: string
  scenario: string
  scenarioBody: string
  scenarioFooter: string
  scenarioHead: string
  scenarioPreview: string
  scenarioRecorder: string
  scenarioStatus: string
  subtitle: string
  summary: string
  title: string
  workspace: string
}

export type ClassNames = keyof Styles

declare const styles: Styles

export default styles
