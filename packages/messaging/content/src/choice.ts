import { Content } from './content'

export interface ChoiceContent extends Content {
  type: 'single-choice'
  text: string
  choices: ChoiceOption[]
}

export interface ChoiceOption {
  title: string
  value: string
}
