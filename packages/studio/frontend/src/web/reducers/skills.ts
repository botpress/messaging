import { NLU, Skill } from 'botpress/sdk'
import { LocalActionDefinition } from 'common/typings'
import { handleActions } from 'redux-actions'
import {
  actionsReceived,
  buildNewSkill,
  cancelNewSkill,
  editSkill,
  intentsReceived,
  requestInsertNewSkill,
  requestUpdateSkill,
  skillsReceived
} from '~/actions'

const defaultSkills = [
  {
    id: 'choice',
    name: 'skills.choice',
    icon: 'numbered-list',
    moduleName: 'basic-skills'
  },
  {
    id: 'CallAPI',
    name: 'skills.callApi',
    icon: 'code-block',
    moduleName: 'basic-skills'
  },
  {
    id: 'Slot',
    name: 'skills.slotFilling',
    icon: 'comparison',
    moduleName: 'basic-skills'
  },
  {
    id: 'SendEmail',
    name: 'skills.sendEmail',
    icon: 'envelope',
    moduleName: 'basic-skills'
  }
]

const defaultState = {
  installed: [],
  builder: {
    opened: false,
    data: {},
    skillId: null,
    action: null,
    editFlowName: null,
    editNodeId: null,
    actions: [],
    location: undefined
  }
}

export interface SkillsReducer {
  installed: Skill[]
  actions: LocalActionDefinition[]
  builder: {
    opened: boolean
    data: any
    skillId?: string
    action?: string
    editFlowName?: string
    editNodeId?: string
    actions: any[]
    location: any
  }
  intents?: NLU.Intent[]
}

const reducer = handleActions(
  {
    [skillsReceived as any]: (state, { payload }) => ({
      ...state,
      installed: [...defaultSkills, ...(payload as any)]
    }),

    [buildNewSkill as any]: (state, { payload }) => ({
      ...state,
      builder: {
        ...state.builder,
        opened: true,
        action: 'new',
        data: {},
        skillId: (payload as any).id,
        location: (payload as any).location
      }
    }),

    [cancelNewSkill as any]: (state) => ({
      ...state,
      builder: {
        ...state.builder,
        opened: false
      }
    }),

    [requestInsertNewSkill as any]: (state, { payload }) => ({
      ...state,
      builder: {
        ...state.builder,
        opened: false,
        data: (payload as any).data,
        skillId: (payload as any).skillId
      }
    }),

    [editSkill as any]: (state, { payload }) => ({
      ...state,
      builder: {
        ...state.builder,
        opened: true,
        action: 'edit',
        skillId: (payload as any).skillId,
        data: (payload as any).data,
        editFlowName: (payload as any).flowName,
        editNodeId: (payload as any).nodeId
      }
    }),

    [requestUpdateSkill as any]: (state) => ({
      ...state,
      builder: {
        ...state.builder,
        opened: false
      }
    }),

    [intentsReceived as any]: (state, { payload }) => ({
      ...state,
      intents: payload
    }),

    [actionsReceived as any]: (state, { payload }) => ({
      ...state,
      actions: payload
    })
  },
  defaultState
)

export default reducer
