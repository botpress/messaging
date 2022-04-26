import { FlowNode, IO } from 'botpress/sdk'
import { FlowView } from 'common/typings'
import _ from 'lodash'
import reduceReducers from 'reduce-reducers'
import { handleActions } from 'redux-actions'
import {
  clearErrorSaveFlows,
  clearFlowMutex,
  closeFlowNodeProps,
  copyFlowNodes,
  copyFlowNodeElement,
  errorSaveFlows,
  handleFlowEditorRedo,
  handleFlowEditorUndo,
  handleRefreshFlowLinks,
  openFlowNodeProps,
  receiveFlows,
  receiveFlowsModification,
  receiveSaveFlows,
  requestCreateFlow,
  requestCreateFlowNode,
  requestDeleteFlow,
  requestDuplicateFlow,
  requestFlows,
  requestInsertNewSkill,
  requestInsertNewSkillNode,
  requestPasteFlowNode,
  requestPasteFlowNodeElement,
  requestRemoveFlowNode,
  requestRenameFlow,
  requestUpdateFlow,
  requestUpdateFlowNode,
  requestUpdateSkill,
  setDebuggerEvent,
  setDiagramAction,
  switchFlow,
  switchFlowNode,
  updateFlowProblems
} from '~/actions'
import { hashCode, prettyId } from '~/util'
import { copyName } from '~/util/flows'

export interface FlowReducer {
  currentFlow?: string
  showFlowNodeProps: boolean
  dirtyFlows: string[]
  errorSavingFlows?: { status: number; message: string }
  flowsByName: _.Dictionary<FlowView>
  currentDiagramAction: string
  buffer: { nodes?: FlowNode[] }
  debuggerEvent?: IO.IncomingEvent
}

const MAX_UNDO_STACK_SIZE = 25
const MIN_HISTORY_RECORD_INTERVAL = 500

const defaultTransition = { condition: 'true', node: '' }

const defaultState = {
  flowsByName: {},
  fetchingFlows: false,
  currentFlow: null,
  currentFlowNode: null,
  showFlowNodeProps: false,
  currentDiagramAction: null,
  currentSnapshot: null,
  undoStack: [],
  redoStack: [],
  buffer: { action: null, transition: null, nodes: null },
  flowProblems: [],
  errorSavingFlows: undefined
}

const findNodesThatReferenceFlow = (state, flowName) =>
  _.flatten(_.values(state.flowsByName).map((flow) => flow.nodes))
    .filter((node) => node.flow === flowName || _.find(node.next, { node: flowName }))
    .map((node) => node.id)

const computeFlowsHash = (state) => {
  return _.values(state.flowsByName).reduce((obj, curr) => {
    if (!curr) {
      return obj
    }

    obj[curr.name] = computeHashForFlow(curr)
    return obj
  }, {})
}

const computeHashForFlow = (flow: FlowView) => {
  const hashAction = (hash, action) => {
    if (_.isArray(action)) {
      action.forEach((c) => {
        if (_.isString(c)) {
          hash += c
        } else {
          hash += c.node
          hash += c.condition
        }
      })
    } else {
      hash += 'null'
    }

    return hash
  }

  let buff = ''
  buff += flow.name
  buff += flow.startNode

  if (flow.catchAll) {
    buff = hashAction(buff, flow.catchAll.onReceive)
    buff = hashAction(buff, flow.catchAll.onEnter)
    buff = hashAction(buff, flow.catchAll.next)
  }

  _.orderBy(flow.nodes, 'id').forEach((node) => {
    buff = hashAction(buff, node.onReceive)
    buff = hashAction(buff, node.onEnter)
    buff = hashAction(buff, node.next)
    buff += node.id
    buff += node.flow
    buff += node.type
    buff += node.name
    buff += node.x
    buff += node.y
  })

  _.orderBy(flow.links, (l) => l.source + l.target).forEach((link) => {
    buff += link.source
    buff += link.target
    link.points &&
      link.points.forEach((p) => {
        buff += p.x
        buff += p.y
      })
  })

  return hashCode(buff)
}

const updateCurrentHash = (state) => ({ ...state, currentHashes: computeFlowsHash(state) })

const createSnapshot = (state) => ({
  ..._.pick(state, ['currentFlow', 'currentFlowNode', 'flowsByName']),
  createdAt: new Date()
})

const recordHistory = (state) => {
  // @ts-ignore
  if (!state.currentSnapshot || new Date() - state.currentSnapshot.createdAt < MIN_HISTORY_RECORD_INTERVAL) {
    return { ...state, currentSnapshot: createSnapshot(state) }
  }
  return {
    ...state,
    undoStack: [state.currentSnapshot, ...state.undoStack.slice(0, MAX_UNDO_STACK_SIZE)],
    redoStack: [],
    currentSnapshot: createSnapshot(state)
  }
}

const popHistory = (stackName) => (state) => {
  const oppositeStack = stackName === 'undoStack' ? 'redoStack' : 'undoStack'
  if (state[stackName].length === 0) {
    return state
  }
  const currentSnapshot = state[stackName][0]

  const newState = {
    ...state,
    currentSnapshot,
    currentFlow: currentSnapshot.currentFlow,
    currentFlowNode: currentSnapshot.currentFlowNode,
    flowsByName: currentSnapshot.flowsByName,
    [stackName]: state[stackName].slice(1),
    [oppositeStack]: [state.currentSnapshot, ...state[oppositeStack]]
  }
  const currentHashes = computeFlowsHash(newState)

  return {
    ...newState,
    currentHashes
  }
}

const doRenameFlow = ({ currentName, newName, flows }) =>
  flows.reduce((obj, f) => {
    if (f.name === currentName) {
      f.name = newName
      f.location = newName
    }

    if (f.nodes) {
      let json = JSON.stringify(f.nodes)
      const regex = new RegExp(currentName, 'g')
      json = json.replace(regex, newName)
      f.nodes = JSON.parse(json)
    }

    const newObj = { ...obj }
    newObj[f.name] = f

    return newObj
  }, {})

const doDeleteFlow = ({ name, flowsByName }) => {
  flowsByName = _.omit(flowsByName, name)
  const flows = _.values(flowsByName)
  return doRenameFlow({ currentName: name, newName: '', flows })
}

const doCreateNewFlow = (name) => {
  const nodes = [
    {
      id: prettyId(),
      name: 'entry',
      onEnter: [],
      onReceive: null,
      next: [defaultTransition],
      type: 'standard',
      x: 100,
      y: 100
    }
  ]

  return {
    version: '0.1',
    name,
    location: name,
    label: undefined,
    description: '',
    startNode: 'entry',
    catchAll: {},
    links: [],
    nodes
  }
}

function isActualCreate(state, modification): boolean {
  return !_.keys(state.flowsByName).includes(modification.name)
}

function isActualUpdate(state, modification): boolean {
  const flowHash = computeHashForFlow(modification.payload)
  const currentFlowHash = computeHashForFlow(state.flowsByName[modification.name])
  return currentFlowHash !== flowHash
}

function isActualDelete(state, modification): boolean {
  return _.keys(state.flowsByName).includes(modification.name)
}

function isActualRename(state, modification): boolean {
  return modification.newName && !_.keys(state.flowsByName).includes(modification.newName)
}

// *****
// Reducer that deals with non-recordable (no snapshot taking)
// *****

let reducer = handleActions(
  {
    [receiveFlowsModification as any]: (state, { payload: modification }) => {
      const modificationType = modification.modification || ''

      const isUpsertFlow =
        (modificationType === 'create' && isActualCreate(state, modification)) ||
        (modificationType === 'update' && isActualUpdate(state, modification))

      if (isUpsertFlow) {
        const newHash = computeHashForFlow(modification.payload)

        return {
          ...state,
          flowsByName: {
            ...state.flowsByName,
            [modification.name]: modification.payload
          },
          currentHashes: {
            ...state.currentHashes,
            [modification.name]: newHash
          },
          initialHashes: {
            ...state.initialHashes,
            [modification.name]: newHash
          }
        }
      }

      if (modificationType === 'delete' && isActualDelete(state, modification)) {
        return {
          ...state,
          flowsByName: _.omit(state.flowsByName, modification.name)
        }
      }

      if (modificationType === 'rename' && isActualRename(state, modification)) {
        const renamedFlow = state.flowsByName[modification.name]
        const flowsByName = _.omit(state.flowsByName, modification.name)
        flowsByName[modification.newName] = renamedFlow

        return {
          ...state,
          flowsByName
        }
      }

      return {
        ...state
      }
    },

    [clearFlowMutex as any]: (state, { payload: name }) => ({
      ...state,
      flowsByName: {
        ...state.flowsByName,
        [name]: _.omit(state.flowsByName[name], 'currentMutex')
      }
    }),

    [updateFlowProblems as any]: (state, { payload }) => ({
      ...state,
      flowProblems: payload
    }),

    [requestFlows as any]: (state) => ({
      ...state,
      fetchingFlows: true
    }),

    [receiveFlows as any]: (state, { payload }) => {
      const flows = _.keys(payload).filter((key) => !payload[key].skillData)
      const newFlow = _.keys(payload).includes('Built-In/welcome.flow.json') && 'Built-In/welcome.flow.json'
      const defaultFlow = newFlow || (_.keys(payload).includes('main.flow.json') ? 'main.flow.json' : _.first(flows))

      const newState = {
        ...state,
        fetchingFlows: false,
        flowsByName: payload,
        currentFlow: state.currentFlow || defaultFlow
      }
      return {
        ...newState,
        currentSnapshot: createSnapshot(newState)
      }
    },

    [receiveSaveFlows as any]: (state) => ({
      ...state,
      errorSavingFlows: undefined
    }),

    [errorSaveFlows as any]: (state, { payload }) => ({
      ...state,
      errorSavingFlows: payload
    }),

    [clearErrorSaveFlows as any]: (state) => ({
      ...state,
      errorSavingFlows: undefined
    }),

    [switchFlowNode as any]: (state, { payload }) => ({
      ...state,
      currentFlowNode: payload
    }),

    [openFlowNodeProps as any]: (state) => ({
      ...state,
      showFlowNodeProps: true
    }),

    [closeFlowNodeProps as any]: (state) => ({
      ...state,
      showFlowNodeProps: false
    }),

    [switchFlow as any]: (state, { payload }) => {
      if (state.currentFlow === payload) {
        return state
      }

      return {
        ...state,
        currentFlowNode: null,
        currentFlow: payload
      }
    },

    [setDiagramAction as any]: (state, { payload }) => ({
      ...state,
      currentDiagramAction: payload
    }),

    [handleRefreshFlowLinks as any]: (state) => ({
      ...state,
      flowsByName: {
        ...state.flowsByName,
        [state.currentFlow]: {
          ...state.flowsByName[state.currentFlow],
          nodes: state.flowsByName[state.currentFlow].nodes.map((node) => ({ ...node, lastModified: new Date() }))
        }
      }
    })
  },
  defaultState as any
)

reducer = reduceReducers(
  reducer,
  handleActions(
    {
      [requestRenameFlow as any]: (state, { payload: { targetFlow, name } }) => ({
        ...state,
        flowsByName: doRenameFlow({
          currentName: targetFlow,
          newName: name,
          flows: _.values(state.flowsByName)
        }),
        currentFlow: name
      }),

      [requestUpdateFlow as any]: (state, { payload }) => {
        const currentFlow = state.flowsByName[state.currentFlow]
        const nodes = !payload.links
          ? currentFlow.nodes
          : currentFlow.nodes.map((node) => {
              const nodeLinks = payload.links.filter((link) => link.source === node.id)
              const next = node.next.map((value, index) => {
                const link = nodeLinks.find((link) => Number(link.sourcePort.replace('out', '')) === index)
                const targetNode = _.find(currentFlow.nodes, { id: (link || {}).target })
                let remapNode = ''

                if (value.node.includes('.flow.json') || value.node === 'END' || value.node.startsWith('#')) {
                  remapNode = value.node
                }

                return { ...value, node: (targetNode && targetNode.name) || remapNode }
              })

              return { ...node, next, lastModified: new Date() }
            })

        const links = (payload.links || currentFlow.links).map((link) => ({
          ...link,
          points: link.points.map(({ x, y }) => ({ x: Math.round(x), y: Math.round(y) }))
        }))

        return {
          ...state,
          flowsByName: {
            ...state.flowsByName,
            [state.currentFlow]: { ...currentFlow, nodes, ...payload, links }
          }
        }
      },

      [requestCreateFlow as any]: (state, { payload: name }) => ({
        ...state,
        flowsByName: {
          ...state.flowsByName,
          [name]: doCreateNewFlow(name)
        },
        currentFlow: name,
        currentFlowNode: null
      }),

      [requestDeleteFlow as any]: (state, { payload: name }) => ({
        ...state,
        currentFlow: state.currentFlow === name ? 'main.flow.json' : state.currentFlow,
        currentFlowNode: state.currentFlow === name ? null : state.currentFlowNode,
        flowsByName: doDeleteFlow({ name, flowsByName: state.flowsByName })
      }),

      // Inserting a new skill essentially:
      // 1. creates a new flow
      // 2. creates a new "skill" node
      // 3. puts that new node in the "insert buffer", waiting for user to place it on the canvas
      [requestInsertNewSkill as any]: (state, { payload }) => {
        const skillId = payload.skillId
        const flowRandomId = prettyId(6)
        const flowName = `skills/${skillId}-${flowRandomId}.flow.json`

        const newFlow = Object.assign({}, payload.generatedFlow, {
          skillData: payload.data,
          name: flowName,
          location: flowName
        })

        const newNode = {
          id: `skill-${flowRandomId}`,
          type: 'skill-call',
          skill: skillId,
          name: payload.nodeName ?? `${skillId}-${flowRandomId}`,
          flow: flowName,
          next: payload.transitions || [],
          onEnter: null,
          onReceive: null
        }

        const newFlowHash = computeHashForFlow(newFlow)

        return {
          ...state,
          flowsByName: {
            ...state.flowsByName,
            [newFlow.name]: newFlow,
            [state.currentFlow]: {
              ...state.flowsByName[state.currentFlow],
              nodes: [
                ...state.flowsByName[state.currentFlow].nodes,
                _.merge(newNode, _.pick(payload.location, ['x', 'y']))
              ]
            }
          },
          currentHashes: {
            ...state.currentHashes,
            [newFlow.name]: newFlowHash
          }
        }
      },

      [requestUpdateSkill as any]: (state, { payload }) => {
        const modifiedFlow = Object.assign({}, state.flowsByName[payload.editFlowName], payload.generatedFlow, {
          skillData: payload.data,
          name: payload.editFlowName,
          location: payload.editFlowName
        })

        const nodes = state.flowsByName[state.currentFlow].nodes.map((node) => {
          if (node.id !== payload.editNodeId) {
            return node
          }

          return {
            ...node,
            next: payload.transitions.map((transition) => {
              const prevTransition =
                node.next.find(({ condition }) => condition === transition.condition) ||
                node.next.find(({ caption }) => caption === transition.caption)

              return { ...transition, node: (prevTransition || {}).node || '' }
            }),
            lastModified: new Date()
          }
        })

        return {
          ...state,
          flowsByName: {
            ...state.flowsByName,
            [payload.editFlowName]: modifiedFlow,
            [state.currentFlow]: {
              ...state.flowsByName[state.currentFlow],
              nodes
            }
          }
        }
      },

      [requestInsertNewSkillNode as any]: (state, { payload }) => ({
        ...state,
        flowsByName: {
          ...state.flowsByName,
          [state.currentFlow]: {
            ...state.flowsByName[state.currentFlow],
            nodes: [
              ...state.flowsByName[state.currentFlow].nodes,
              _.merge(state.buffer.nodes, _.pick(payload, ['x', 'y']))
            ]
          }
        }
      }),

      [requestDuplicateFlow as any]: (state, { payload: { flowNameToDuplicate, name } }) => {
        return {
          ...state,
          flowsByName: {
            ...state.flowsByName,
            [name]: {
              ...state.flowsByName[flowNameToDuplicate],
              name,
              location: name,
              nodes: state.flowsByName[flowNameToDuplicate].nodes.map((node) => ({
                ...node,
                id: prettyId()
              }))
            }
          },
          currentFlow: name,
          currentFlowNode: null
        }
      },

      [requestUpdateFlowNode as any]: (state, { payload }) => {
        payload = Array.isArray(payload) ? payload : [{ ...payload, id: payload.id ?? state.currentFlowNode }]
        const currentFlow = state.flowsByName[state.currentFlow]
        const nodesToUpdate = payload
          .map((node) =>
            _.find(currentFlow.nodes, {
              id: node.id
            })
          )
          .filter(Boolean)

        if (nodesToUpdate.length === 0) {
          return state
        }

        // Find the replacement name, if there is any
        const findNewName = (name) => {
          const nodeToUpdate = _.find(nodesToUpdate, {
            name
          })
          return (
            nodeToUpdate &&
            _.find(payload, {
              id: nodeToUpdate.id
            }).name
          )
        }

        const updateNodeName = (elements) =>
          elements.map((element) => {
            return {
              ...element,
              node: findNewName(element.node) ?? element.node
            }
          })

        return {
          ...state,
          flowsByName: {
            ...state.flowsByName,
            [state.currentFlow]: {
              ...currentFlow,
              startNode: findNewName(currentFlow.startNode) ?? currentFlow.startNode,
              nodes: currentFlow.nodes.map((node) => {
                if (!_.find(nodesToUpdate, { id: node.id })) {
                  return {
                    ...node,
                    next: node.next && updateNodeName(node.next)
                  }
                }

                const nodeToUpdatePayload = _.find(payload, {
                  id: node.id
                })
                return {
                  ...node,
                  ...nodeToUpdatePayload,
                  next: nodeToUpdatePayload.next || (node.next && updateNodeName(node.next)),
                  lastModified: new Date()
                }
              }),
              catchAll: {
                ...currentFlow.catchAll,
                next: currentFlow.catchAll.next && updateNodeName(currentFlow.catchAll.next)
              }
            }
          }
        }
      },

      [requestRemoveFlowNode as any]: (state, { payload }) => {
        const flowsToRemove = []
        const nodeToRemove = _.find(state.flowsByName[state.currentFlow].nodes, { id: payload?.id })

        if (nodeToRemove.type === 'skill-call') {
          if (findNodesThatReferenceFlow(state, nodeToRemove.flow).length <= 1) {
            // Remove the skill flow if that was the only node referencing it
            flowsToRemove.push(nodeToRemove.flow)
          }
        }

        return {
          ...state,
          flowsByName: {
            ..._.omit(state.flowsByName, flowsToRemove),
            [state.currentFlow]: {
              ...state.flowsByName[state.currentFlow],
              nodes: state.flowsByName[state.currentFlow].nodes.filter((node) => node.id !== payload.id)
            }
          }
        }
      },

      [copyFlowNodes as any]: (state, { payload }) => {
        const nodes = payload
          ?.map((nodeId) => _.find(state.flowsByName[state.currentFlow].nodes, { id: nodeId }))
          .filter((node) => node)
        if (!nodes || !nodes.length) {
          return state
        }
        return {
          ...state,
          buffer: { ...state.buffer, nodes }
        }
      },

      [requestPasteFlowNode as any]: (state, { payload: { x, y, nodes } }) => {
        const nodesToPaste = nodes || state.buffer.nodes
        if (!nodesToPaste?.length) {
          return state
        }

        const currentFlow = state.flowsByName[state.currentFlow]
        const siblingNames = currentFlow.nodes.map(({ name }) => name)
        const newNodes = _.cloneDeep(nodesToPaste).map((node) => {
          const newNodeId = prettyId()
          const newName = copyName(siblingNames, node.name)
          return { ...node, id: newNodeId, newName, lastModified: new Date() }
        })

        // Calculate x,y center position from multiple nodes
        const xCenter = _.reduce(newNodes, (sum, elem) => sum + elem.x, 0) / newNodes.length
        const yCenter = _.reduce(newNodes, (sum, elem) => sum + elem.y, 0) / newNodes.length

        newNodes.forEach((node) => {
          // Recalculate position to fit the new flow and cursor position
          node.x = node.x - xCenter + x
          node.y = node.y - yCenter + y

          // Migrate transitions
          if (node.next) {
            for (const transition of node.next) {
              const node = _.find(newNodes, { name: transition?.node })
              transition.node = node ? node.newName : ''
            }
          }
        })

        // Migrate node name now that all transitions have been migrated
        newNodes.forEach((node) => {
          node.name = node.newName
          delete node.newName
        })

        return {
          ...state,
          currentFlowNode: newNodes[0].id,
          flowsByName: {
            ...state.flowsByName,
            [state.currentFlow]: {
              ...currentFlow,
              nodes: [...currentFlow.nodes, ...newNodes]
            }
          }
        }
      },

      [setDebuggerEvent as any]: (state, { payload }) => ({
        ...state,
        debuggerEvent: payload
      }),

      [copyFlowNodeElement as any]: (state, { payload }) => ({
        ...state,
        buffer: {
          ...state.buffer,
          ...payload
        }
      }),

      [requestPasteFlowNodeElement as any]: (state, { payload }) => {
        const SECTION_TYPES = { onEnter: 'action', onReceive: 'action', next: 'transition' }
        const element = state.buffer[SECTION_TYPES[payload]]
        if (!element) {
          return state
        }

        const currentFlow = state.flowsByName[state.currentFlow]
        const currentNode = _.find(currentFlow.nodes, { id: state.currentFlowNode })

        // TODO: use this as a helper function in other reducers
        const updateCurrentFlow = (modifier) => ({
          ...state,
          flowsByName: { ...state.flowsByName, [state.currentFlow]: { ...currentFlow, ...modifier } }
        })

        if (currentNode) {
          return updateCurrentFlow({
            nodes: [
              ...currentFlow.nodes.filter(({ id }) => id !== state.currentFlowNode),
              { ...currentNode, [payload]: [...(currentNode[payload] || []), element] }
            ]
          })
        }

        return updateCurrentFlow({
          catchAll: {
            ...currentFlow.catchAll,
            [payload]: [...currentFlow.catchAll[payload], element]
          }
        })
      },

      [requestCreateFlowNode as any]: (state, { payload }) => ({
        ...state,
        flowsByName: {
          ...state.flowsByName,
          [state.currentFlow]: {
            ...state.flowsByName[state.currentFlow],
            nodes: [
              ...state.flowsByName[state.currentFlow].nodes,
              _.merge(
                {
                  id: prettyId(),
                  name: `node-${prettyId(4)}`,
                  x: 0,
                  y: 0,
                  next: [],
                  onEnter: [],
                  onReceive: null
                },
                payload
              )
            ]
          }
        }
      })
    },
    defaultState as any
  )
)

// *****
// Reducer that creates the 'initial hash' of flows (for dirty detection)
// Resets the 'dirty' state when a flow is saved
// *****

reducer = reduceReducers(
  reducer,
  handleActions(
    {
      [receiveFlows as any]: (state) => {
        const hashes = computeFlowsHash(state)
        return { ...state, currentHashes: hashes, initialHashes: hashes }
      },

      [receiveSaveFlows as any]: (state) => {
        const hashes = computeFlowsHash(state)
        return { ...state, currentHashes: hashes, initialHashes: hashes }
      },

      [requestUpdateFlow as any]: updateCurrentHash,
      [requestRenameFlow as any]: updateCurrentHash,
      [requestUpdateFlowNode as any]: updateCurrentHash,

      [requestCreateFlowNode as any]: updateCurrentHash,
      [requestCreateFlow as any]: updateCurrentHash,
      [requestDeleteFlow as any]: updateCurrentHash,
      [requestDuplicateFlow as any]: updateCurrentHash,
      [requestRemoveFlowNode as any]: updateCurrentHash,
      [requestPasteFlowNode as any]: updateCurrentHash,
      [requestInsertNewSkill as any]: updateCurrentHash,
      [requestInsertNewSkillNode as any]: updateCurrentHash,
      [requestUpdateSkill as any]: updateCurrentHash,
      [requestPasteFlowNodeElement as any]: updateCurrentHash
    },
    defaultState
  )
)

// *****
// Reducer that records state of the flows for undo/redo
// *****

reducer = reduceReducers(
  reducer,
  handleActions(
    {
      [requestRenameFlow as any]: recordHistory,
      [requestUpdateFlowNode as any]: recordHistory,
      [requestCreateFlowNode as any]: recordHistory,
      [requestCreateFlow as any]: recordHistory,
      [requestDeleteFlow as any]: recordHistory,
      [requestDuplicateFlow as any]: recordHistory,
      [requestRemoveFlowNode as any]: recordHistory,
      [requestPasteFlowNode as any]: recordHistory,
      [requestInsertNewSkill as any]: recordHistory,
      [requestInsertNewSkillNode as any]: recordHistory,
      [requestUpdateSkill as any]: recordHistory,
      [requestPasteFlowNodeElement as any]: recordHistory,
      [handleFlowEditorUndo as any]: popHistory('undoStack'),
      [handleFlowEditorRedo as any]: popHistory('redoStack')
    },
    defaultState
  )
)

export default reducer
