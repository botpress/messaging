import {
  Flow,
  FlowNode,
  IO,
  ParsedContentType,
  RolloutStrategy,
  StageRequestApprovers,
  StrategyUser
} from 'botpress/sdk'
import { Request } from 'express'

export interface IDisposeOnExit {
  disposeOnExit(): void
}

export interface UniqueUser {
  email: string
  strategy: string
}

export interface Workspace {
  id: string
  name: string
  description?: string
  /** An optional string of characters which must precede the ID of each bots in this workspace */
  botPrefix?: string
  audience: 'internal' | 'external'
  roles: AuthRole[]
  defaultRole: string
  adminRole: string
  bots: string[]
  pipeline: Pipeline
  rolloutStrategy: RolloutStrategy
}

export interface AuthRule {
  res: string
  op: string
}

export interface IInitializeFromConfig {
  initializeFromConfig(config: any): void
}

export interface AuthRole {
  id: string
  name: string
  description: string
  rules: Array<AuthRule>
}

export interface StoredToken {
  token: string
  expiresAt: number
  issuedAt: number
}

export interface TokenUser {
  email: string
  strategy: string
  tokenVersion: number
  isSuperAdmin: boolean
  csrfToken?: string
  exp?: number
  iat?: number
}

export interface TokenResponse {
  jwt: string
  csrf: string
  exp: number
}

export type RequestWithUser = Request & {
  tokenUser?: TokenUser
  authUser?: StrategyUser
  workspace?: string
}

export type Pipeline = Stage[]

export type StageAction = 'promote_copy' | 'promote_move'

export interface Stage {
  id: string
  label: string
  action: StageAction
  reviewers: StageRequestApprovers[]
  minimumApprovals: number
  reviewSequence: 'serial' | 'parallel'
}

export interface FlowMutex {
  lastModifiedBy: string
  lastModifiedAt: Date
  remainingSeconds?: number // backend calculate this because all clients time might be wrong
}

export type FlowView = Flow & {
  nodes: NodeView[]
  links: NodeLinkView[]
  currentMutex?: FlowMutex
}

export interface NodeLinkView {
  source: string
  target: string
  points: FlowPoint[]
}

export interface FlowPoint {
  x: number
  y: number
}

export type NodeView = FlowNode & FlowPoint

export interface LibraryElement {
  contentId: string
  type: 'say_something' | 'execute'
  preview: string
  path: string
}

export interface Categories {
  registered: ParsedContentType[]
  unregistered: Pick<ParsedContentType, 'id' | 'title'>[]
}

export interface OutgoingEventCommonArgs {
  event: IO.Event
  // Any other additional property
  [property: string]: any
}

export interface EventCommonArgs {
  event: IO.IncomingEvent
  user: { [attribute: string]: any }
  temp: { [property: string]: any }
  bot: { [property: string]: any }
  session: IO.CurrentSession
  // Any other additional property
  [property: string]: any
}

export interface ActionServer {
  id: string
  baseUrl: string
}

export type ActionScope = 'bot' | 'global'

export interface ActionDefinition {
  name: string
  category: string
  description: string
  author: string
  params: ActionParameterDefinition[]
}

export type LocalActionDefinition = ActionDefinition & {
  title: string
  scope: ActionScope
  legacy: boolean
  hidden: boolean
}

export interface ActionParameterDefinition {
  name: string
  description: string
  required: boolean
  type: string
  default: string
}

export type ActionServerWithActions = ActionServer & {
  actions: ActionDefinition[] | undefined
}

export interface NodeProblem {
  nodeName: string
  missingPorts: any
}

type QnaAction = 'text' | 'redirect' | 'text_redirect'

export interface QnaEntry {
  action: QnaAction
  contexts: string[]
  enabled: boolean
  questions: {
    [lang: string]: string[]
  }
  answers: {
    [lang: string]: string[]
  }
  redirectFlow: string
  redirectNode: string
}

export interface QnaItem {
  id: string
  isNew?: boolean
  key?: string
  saveError?: string
  data: QnaEntry
}
