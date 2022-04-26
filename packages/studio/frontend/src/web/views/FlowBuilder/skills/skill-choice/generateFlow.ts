import * as sdk from 'botpress/sdk'
import _ from 'lodash'
import yn from 'yn'
import { NodeActionType } from '../typings'

export const MAX_LABEL_LENGTH = 8

export interface ChoiceData {
  contentId: string
  invalidContentId: string
  keywords: any
  config: ChoiceConfig
  randomId?: string
}

export interface ChoiceConfig {
  nbMaxRetries: number
  repeatChoicesOnInvalid: boolean
  contentElement: string
  variableName: string
}

export const generateFlow = async (data: ChoiceData): Promise<sdk.FlowGenerationResult> => {
  const { variableName } = data.config
  const randomId = variableName && variableName.length ? variableName : data.randomId
  const hardRetryLimit = 10
  const nbMaxRetries = Math.min(Number(data.config.nbMaxRetries), hardRetryLimit)
  const repeatQuestion = yn(data.config.repeatChoicesOnInvalid)

  const sorrySteps: any = []

  if (data.invalidContentId && data.invalidContentId.length >= 3) {
    sorrySteps.push({
      type: NodeActionType.RenderElement,
      name: `#!${data.invalidContentId}`
    })
  }

  if (repeatQuestion) {
    sorrySteps.push({
      type: NodeActionType.RenderElement,
      name: `#!${data.contentId}`,
      args: { skill: 'choice' }
    })
  }

  const nodes: sdk.FlowNode[] = [
    {
      name: 'entry',
      onEnter: [
        {
          type: NodeActionType.RenderElement,
          name: `#!${data.contentId}`,
          args: { skill: 'choice' }
        }
      ],
      next: [{ condition: 'true', node: 'parse' }]
    },
    {
      name: 'parse',
      onReceive: [
        {
          type: NodeActionType.RunAction,
          name: 'basic-skills/choice_parse_answer',
          args: { ...data, randomId }
        }
      ],
      next: [
        { condition: `temp['skill-choice-valid-${randomId}'] === true`, node: '#' },
        { condition: 'true', node: 'invalid' }
      ]
    },
    {
      name: 'invalid',
      onEnter: [
        {
          type: NodeActionType.RunAction,
          name: 'basic-skills/choice_invalid_answer',
          args: { randomId }
        }
      ],
      next: [
        {
          condition: `Number(temp['skill-choice-invalid-count-${randomId}']) > Number(${nbMaxRetries})`,
          node: '#'
        },
        { condition: 'true', node: 'sorry' }
      ]
    },
    {
      name: 'sorry',
      onEnter: sorrySteps,
      next: [{ condition: 'true', node: 'parse' }]
    }
  ]

  return {
    transitions: createTransitions(data, randomId),
    flow: {
      nodes,
      catchAll: {
        next: []
      }
    }
  }
}

const createTransitions = (data, randomId) => {
  const transitions: sdk.NodeTransition[] = Object.keys(data.keywords).map((choice) => {
    const choiceShort = choice.length > 8 ? choice.substr(0, 7) + '...' : choice

    return {
      caption: `User picked [${choiceShort}]`,
      condition: `temp['skill-choice-ret-${randomId}'] == "${choice}"`,
      node: ''
    }
  })

  transitions.push({
    caption: 'On failure',
    condition: 'true',
    node: ''
  })

  return transitions
}
