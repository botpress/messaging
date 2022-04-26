import axios from 'axios'
import * as sdk from 'botpress/sdk'
import { FlowPoint, FlowView, NodeProblem } from 'common/typings'
import _ from 'lodash'
import { nanoid } from 'nanoid'
import { createAction } from 'redux-actions'
import { copyName } from '~/util/flows'
// import { doGenerateFlow } from '~/views/FlowBuilder/skills/flowGenerator'
import { getDeletedFlows, getDirtyFlows, getModifiedFlows, getNewFlows } from '../reducers/selectors'
import { FlowsAPI } from './api'

export const receiveFlowsModification = createAction('FLOWS/MODIFICATIONS/RECEIVE')

const MUTEX_UNLOCK_SECURITY_FACTOR = 1.25
const mutexHandles: _.Dictionary<number> = {}

export default function debounceAction(action: any, delay: number, options?: _.DebounceSettings) {
  const debounced = _.debounce((dispatch, actionArgs) => dispatch(action(...actionArgs)), delay, options)
  return (...actionArgs) =>
    (dispatch) =>
      debounced(dispatch, actionArgs)
}

export const handleReceiveFlowsModification = (modification) => (dispatch, getState) => {
  const dirtyFlows = getDirtyFlows(getState() as never)
  const amIModifyingTheSameFlow = dirtyFlows.includes(modification.name)
  if (amIModifyingTheSameFlow) {
    FlowsAPI.cancelUpdate(modification.name)
  }

  dispatch(receiveFlowsModification(modification))
  dispatch(refreshFlowsLinks())

  if (_.has(modification, 'payload.currentMutex') && _.has(modification, 'payload.name')) {
    dispatch(startMutexCountDown(modification.payload))
  }
}

const startMutexCountDown = (flow: FlowView) => (dispatch) => {
  const { name, currentMutex } = flow
  if (!currentMutex || !currentMutex.remainingSeconds) {
    return
  }

  const handle = mutexHandles[name]
  if (handle) {
    clearTimeout(handle)
  }
  mutexHandles[name] = window.setTimeout(() => {
    dispatch(clearFlowMutex(name))
  }, currentMutex.remainingSeconds * 1000 * MUTEX_UNLOCK_SECURITY_FACTOR)
}

export const clearFlowMutex = createAction('FLOWS/MODIFICATIONS/CLEAR_MUTEX')

export const requestFlows = createAction('FLOWS/REQUEST')
export const receiveFlows = createAction(
  'FLOWS/RECEIVE',
  (flows) => flows,
  () => ({ receiveAt: new Date() })
)

export const fetchFlows = () => (dispatch) => {
  dispatch(requestFlows())

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  axios
    .get(`${window.STUDIO_API_PATH}/flows`)
    .then(({ data }) => {
      const flows = _.keyBy(data, 'name')
      dispatch(receiveFlows(flows))
      return flows
    })
    .then((flows) => {
      for (const flow of _.values(flows)) {
        dispatch(startMutexCountDown(flow))
      }
    })
}

export const receiveSaveFlows = createAction(
  'FLOWS/SAVE/RECEIVE',
  (flows) => flows,
  () => ({ receiveAt: new Date() })
)
export const errorSaveFlows = createAction('FLOWS/SAVE/ERROR')
export const clearErrorSaveFlows: () => void = createAction('FLOWS/SAVE/ERROR/CLEAR')

// actions that modifies flow
export const requestUpdateFlow = createAction('FLOWS/FLOW/UPDATE')
export const requestRenameFlow = createAction('FLOWS/FLOW/RENAME')
export const requestCreateFlow = createAction('FLOWS/CREATE')
export const requestDeleteFlow = createAction('FLOWS/DELETE')
export const requestDuplicateFlow = createAction('FLOWS/DUPLICATE')

export const requestUpdateFlowNode = createAction('FLOWS/FLOW/UPDATE_NODE')
export const requestCreateFlowNode = createAction('FLOWS/FLOW/CREATE')
export const requestRemoveFlowNode = createAction('FLOWS/FLOW/REMOVE')

export const requestPasteFlowNode = createAction('FLOWS/NODE/PASTE')
export const requestPasteFlowNodeElement = createAction('FLOWS/NODE_ELEMENT/PASTE')

const wrapAction =
  (
    requestAction,
    asyncCallback: (payload, state, dispatch) => Promise<any>,
    receiveAction = receiveSaveFlows,
    errorAction = errorSaveFlows
  ) =>
  (payload?: any) =>
  (dispatch, getState) => {
    dispatch(requestAction(payload))
    asyncCallback(payload, getState(), dispatch)
      .then(() => dispatch(receiveAction()))
      .catch((err) => dispatch(errorAction(err)))
  }

const updateCurrentFlow = async (_payload, state) => {
  const flowState = state.flows
  return FlowsAPI.updateFlow(flowState, flowState.currentFlow)
}

const saveDirtyFlows = async (state) => {
  const dirtyFlows = getModifiedFlows(state).filter((name) => !!state.flows.flowsByName[name])

  const promises = []
  for (const flow of dirtyFlows) {
    promises.push(FlowsAPI.updateFlow(state.flows, flow))
  }
  return Promise.all(promises)
}

export const updateFlow: (flow: Partial<FlowView>) => void = wrapAction(requestUpdateFlow, updateCurrentFlow)

export const renameFlow: (flow: { targetFlow: string; name: string }) => void = wrapAction(
  requestRenameFlow,
  async (payload, state) => {
    const { targetFlow, name } = payload
    await FlowsAPI.renameFlow(state.flows, targetFlow, name)
    await saveDirtyFlows(state)
  }
)

export const createFlow: (name: string) => void = wrapAction(requestCreateFlow, async (payload, state) => {
  const name = payload
  const flowState = state.flows
  await FlowsAPI.createFlow(flowState, name)
})

export const deleteFlow: (flowName: string) => void = wrapAction(requestDeleteFlow, async (payload, state) => {
  await FlowsAPI.deleteFlow(state.flows, payload)
  await saveDirtyFlows(state)
})

export const duplicateFlow: (flow: { flowNameToDuplicate: string; name: string }) => void = wrapAction(
  requestDuplicateFlow,
  async (payload, state) => {
    const { name } = payload
    const flowState = state.flows
    await FlowsAPI.createFlow(flowState, name)
  }
)

type AllPartialNode = Partial<sdk.FlowNode> & Partial<FlowPoint>

export const updateFlowNode: (props: AllPartialNode | (AllPartialNode & Pick<Required<sdk.FlowNode>, 'id'>)[]) => void =
  wrapAction(requestUpdateFlowNode, updateCurrentFlow)

export const createFlowNode: (props: AllPartialNode) => void = wrapAction(requestCreateFlowNode, updateCurrentFlow)

export const removeFlowNode: (element: any) => void = wrapAction(requestRemoveFlowNode, async (payload, state) => {
  await updateCurrentFlow(payload, state)

  // If node is a skill and there's no references to it, then the complete flow is deleted
  const deletedFlows = getDeletedFlows(state)
  if (deletedFlows.length) {
    await FlowsAPI.deleteFlow(state.flows, deletedFlows[0])
  }
})

export const pasteFlowNode = (payload: { x: number; y: number }) => async (dispatch, getState) => {
  const state = getState()
  const skills = state.flows.buffer.nodes.filter((node) => node.skill)
  const nonSkills = state.flows.buffer.nodes.filter((node) => !node.skill)
  const currentFlowNodeNames = state.flows.flowsByName[state.flows.currentFlow].nodes.map(({ name }) => name)

  // Create new flows for all skills

  for (const node of skills) {
    let { skillData } = state.flows.flowsByName[node.flow]
    const randomId = nanoid(10)
    skillData = { ...skillData, randomId }
    // const data = (await doGenerateFlow(skillData, node.skill)) as any
    // TODO: fix this after generateFlow has been replaced
    const data: any = {}
    dispatch(
      requestInsertNewSkill({
        skillId: node.skill,
        data: skillData,
        location: payload,
        generatedFlow: data.flow,
        transitions: data.transitions,
        nodeName: copyName(currentFlowNodeNames, node.name)
      })
    )
    const flows = getState().flows
    const flowsByName = flows.flowsByName
    const newFlowKey = Object.keys(flowsByName).find((key) => flowsByName[key].skillData?.randomId === randomId)
    await FlowsAPI.createFlow(flows, newFlowKey)
  }

  // Paste non-skills
  dispatch(requestPasteFlowNode({ ...payload, nodes: nonSkills }))
  await updateCurrentFlow(payload, state)
  dispatch(refreshFlowsLinks())
}

export const pasteFlowNodeElement = wrapAction(requestPasteFlowNodeElement, updateCurrentFlow)

// actions that do not modify flow
export const switchFlow: (flowName: string) => void = createAction('FLOWS/SWITCH')
export const switchFlowNode: (nodeId: string) => void = createAction('FLOWS/FLOW/SWITCH_NODE')
export const openFlowNodeProps: () => void = createAction('FLOWS/FLOW/OPEN_NODE_PROPS')
export const closeFlowNodeProps: () => void = createAction('FLOWS/FLOW/CLOSE_NODE_PROPS')

export const handleRefreshFlowLinks = createAction('FLOWS/FLOW/UPDATE_LINKS')
export const refreshFlowsLinks = debounceAction(handleRefreshFlowLinks, 500, { leading: true })
export const updateFlowProblems: (problems: NodeProblem[]) => void = createAction('FLOWS/FLOW/UPDATE_PROBLEMS')

export const copyFlowNodes: (nodeIds: string[]) => void = createAction('FLOWS/NODE/COPY')
export const copyFlowNodeElement = createAction('FLOWS/NODE_ELEMENT/COPY')

export const handleFlowEditorUndo = createAction('FLOWS/EDITOR/UNDO')
export const handleFlowEditorRedo = createAction('FLOWS/EDITOR/REDO')

export const flowEditorUndo = wrapAction(handleFlowEditorUndo, async (payload, state, dispatch) => {
  dispatch(refreshFlowsLinks())
  await updateCurrentFlow(payload, state)
  await createNewFlows(state)
})

export const flowEditorRedo = wrapAction(handleFlowEditorRedo, async (payload, state, dispatch) => {
  dispatch(refreshFlowsLinks())
  await updateCurrentFlow(payload, state)
  await createNewFlows(state)
})

export const setDiagramAction: (action: string) => void = createAction('FLOWS/FLOW/SET_ACTION')
export const setDebuggerEvent = createAction('FLOWS/SET_DEBUGGER_EVENT')

export const skillsReceived = createAction('SKILLS/RECEIVED')
export const fetchSkills = () => (dispatch) => {
  // TODO cleanup
  dispatch(skillsReceived([]))
}

// Skills
export const requestInsertNewSkill = createAction('SKILLS/INSERT')
export const requestInsertNewSkillNode = createAction('SKILLS/INSERT/NODE')
export const requestUpdateSkill = createAction('SKILLS/UPDATE')

export const buildNewSkill: ({ location: any, id: string }) => void = createAction('SKILLS/BUILD')
export const cancelNewSkill = createAction('SKILLS/BUILD/CANCEL')

export const insertNewSkill = wrapAction(requestInsertNewSkill, async (payload, state) => {
  await updateCurrentFlow(payload, state)
  await createNewFlows(state)
})

const createNewFlows = async (state) => {
  const newFlows: string[] = getNewFlows(state)
  for (const newFlow of newFlows) {
    await FlowsAPI.createFlow(state.flows, newFlow)
  }
}

export const insertNewSkillNode = wrapAction(requestInsertNewSkillNode, updateCurrentFlow)

export const updateSkill = wrapAction(requestUpdateSkill, async (payload, state) => {
  const { editFlowName } = payload
  const { flows: flowState } = state
  await Promise.all([
    FlowsAPI.updateFlow(flowState, editFlowName),
    FlowsAPI.updateFlow(flowState, flowState.currentFlow)
  ])
})

export const editSkill = createAction('SKILLS/EDIT')
export const requestEditSkill = (nodeId) => (dispatch, getState) => {
  const state = getState()
  const node = _.find(state.flows.flowsByName[state.flows.currentFlow].nodes, { id: nodeId })
  const flow = node && state.flows.flowsByName[node.flow]

  flow &&
    dispatch(
      editSkill({
        skillId: node.skill,
        flowName: node.flow,
        nodeId,
        data: flow.skillData
      })
    )
}

export const actionsReceived = createAction('ACTIONS/RECEIVED')
export const refreshActions = () => (dispatch) => {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  axios.get(`${window.STUDIO_API_PATH}/actions`).then(({ data }) => {
    dispatch(
      actionsReceived(
        _.sortBy(
          data.filter((action) => !action.hidden),
          ['category', 'name']
        )
      )
    )
  })
}
