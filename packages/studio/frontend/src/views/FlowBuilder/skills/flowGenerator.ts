import { ActionBuilderProps, Flow, FlowGenerationResult, SkillFlow } from 'botpress/sdk'
import _ from 'lodash'
import { customAlphabet } from 'nanoid'

import { generateFlow as callApi } from './skill-call-api'
import { generateFlow as choice } from './skill-choice'
import { generateFlow as email } from './skill-send-email'
import { generateFlow as slot } from './skill-slot'
import { NodeActionType } from './typings'

export const doGenerateFlow = async (data: any, skillId: string) => {
  const generateFlow = getFlowGenerator(skillId)
  const partialFlow = await generateFlow(data, { botId: window.BOT_ID })
  return finalizeFlow(partialFlow)
}

function getFlowGenerator(skillId: string) {
  switch (skillId) {
    case 'choice':
      return choice
    case 'CallAPI':
      return callApi
    case 'Slot':
      return slot
    case 'SendEmail':
      return email
  }
}

function finalizeFlow(partialFlow: FlowGenerationResult) {
  if (_.get(partialFlow, 'flow.nodes.length') === 0) {
    throw new Error('You must provide a flow with at least one node')
  }

  const completeFlow = setDefaultsForMissingValues(partialFlow.flow)

  // Convert ActonBuilderProps to string, since dialog flow can't handle objects
  for (const node of completeFlow.nodes) {
    node.onReceive = parseActionQuery(node.onReceive)
    node.onEnter = parseActionQuery(node.onEnter)
  }

  // TODO change when studio is updated, since actual doesn't support catchall
  return { flow: completeFlow, transitions: partialFlow.transitions }
}

function parseActionQuery(nodes): string[] | undefined {
  if (typeof nodes === 'undefined') {
    return undefined
  }

  return (nodes && nodes.length && nodes.map(actionToString)) || []
}

function actionToString(action: ActionBuilderProps): string {
  let finalNode: string = ''
  if (action.type === NodeActionType.RunAction) {
    finalNode = action.args ? `${action.name} ${JSON.stringify(action.args)}` : action.name
  } else if (action.type === NodeActionType.RenderText) {
    finalNode = `say #builtin_text ${action.name}`
  } else if (action.type === NodeActionType.RenderElement) {
    const args = action.args || {}
    finalNode = _.isString(args) ? `say ${action.name} ${args}` : `say ${action.name} ${JSON.stringify(args)}`
  }

  return finalNode
}

function setDefaultsForMissingValues(partialFlow: SkillFlow): Flow {
  const defaultNode = {
    id: '',
    name: '',
    onEnter: [],
    onReceive: undefined,
    next: []
  }

  _.forEach(partialFlow.nodes, (node) => {
    defaultNode.id = customAlphabet('1234567890', 6)()
    node = _.defaults(node, defaultNode)
  })

  const name = customAlphabet('1234567890', 6)()
  const defaultFlow: Flow = {
    version: '0.0',
    name,
    location: name,
    startNode: partialFlow.nodes[0].name,
    nodes: []
  }

  return _.defaults(partialFlow, defaultFlow)
}
