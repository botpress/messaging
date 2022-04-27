export interface Incident {
  id: string
  ruleName: string
  hostName: string
  startTime: Date
  endTime?: Date
  triggerValue: number
}

export type StrategyUser = {
  id?: number
  password?: string
  salt?: string
  tokenVersion: number
} & UserInfo

export interface UserInfo {
  email: string
  strategy: string
  createdOn?: string
  updatedOn?: string
  attributes: any
}

export interface LoggerEntry {
  botId?: string
  hostname?: string
  level: string
  scope: string
  message: string
  metadata: any
  timestamp: Date
}

export enum LoggerLevel {
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
  Critical = 'critical',
  Debug = 'debug'
}

export enum LogLevel {
  PRODUCTION = 0,
  DEV = 1,
  DEBUG = 2
}

export interface LoggerListener {
  (level: LogLevel, message: string, args: any): void
}

export interface Logger {
  forBot(botId: string): this
  attachError(error: unknown): this
  /**
   * Attaching an event to the log entry will display the associated logs in the Processing tab on the debugger
   */
  attachEvent(event: IO.Event): this
  persist(shouldPersist: boolean): this
  level(level: LogLevel): this
  noEmit(): this

  /**
   * Sets the level that will be required at runtime to
   * display the next message.
   * 0 = Info / Error (default)
   * 1 = Warning
   * 2 = Debug
   * 3 = Silly
   * @param level The level to apply for the next message
   */
  level(level: LogLevel): this
  debug(message: string, metadata?: any): void
  info(message: string, metadata?: any): void
  warn(message: string, metadata?: any): void
  error(message: string, metadata?: any): void
  critical(message: string, metadata?: any): void
}

export type ElementChangedAction = 'create' | 'update' | 'delete'

/**
 * Identifies new Bot Template that can be used to speed up the creation of a new bot without
 * having to start from scratch
 */
export interface BotTemplate {
  /** Used internally to identify this template  */
  id: string
  /** The name that will be displayed in the bot template menu */
  name: string
  /** Gives a short description of your module, which is displayed once the template is selected */
  desc: string
  /** These are used internally by Botpress when they are registered on startup */
  readonly moduleId?: string
  readonly moduleName?: string
}

export interface ModuleDefinition {
  /** This name should be in lowercase and without special characters (only - and _) */
  name: string
  fullName?: string
  plugins?: ModulePluginEntry[]
  /** Additional options that can be applied to the module's view */
  moduleView?: ModuleViewOptions
  /** If set to true, no menu item will be displayed */
  noInterface?: boolean
  /**
   * An icon to display next to the name, if none is specified, it will receive a default one
   * There is a separate icon for the admin and the studio, if you set menuIcon to 'icon.svg',
   * please provide an icon named 'studio_icon.svg' and 'admin_icon.svg'
   */
  menuIcon?: string
  /**
   * The name displayed on the menu
   * @deprecated Set the property "fullName" in the translations file for the desired language
   */
  menuText?: string
  /** Optionally specify a link to your page or github repo */
  homepage?: string
  /** Whether or not the module is likely to change */
  experimental?: boolean
  /** Workspace Apps are accessible on the admin panel */
  workspaceApp?: {
    /** Adds a link on the Bots page to access this app for a specific bot */
    bots?: boolean
    /** Adds an icon on the menu to access this app without a bot ID */
    global?: boolean
  }
}

/**
 * Skills are loaded automatically when the bot is started. They must be in the module's definition to be loaded.
 * Each skills must have a flow generator and a view with the same name (skillId)
 */
export interface Skill {
  /** An identifier for the skill. Use only a-z_- characters. */
  id: string
  /** The name that will be displayed in the toolbar for the skill */
  name: string
  /** An icon to identify the skill */
  icon?: string | any
  /** Name of the parent module. This field is filled automatically when they are loaded */
  readonly moduleName?: string
  /**
   * When adding a new skill on the Flow Editor, the flow is constructed dynamically by this method
   *
   * @param skillData Provided by the skill view, those are fields edited by the user on the Flow Editor
   * @param metadata Some metadata automatically provided, like the bot id
   * @return The method should return
   */
  flowGenerator: (skillData: any, metadata: FlowGeneratorMetadata) => Promise<FlowGenerationResult>
}

export interface FlowGeneratorMetadata {
  botId: string
}

export interface ModulePluginEntry {
  entry: 'WebBotpressUIInjection'
  position: 'overlay'
}

export interface ModuleViewOptions {
  stretched: boolean
}

export namespace NLU {
  /**
   * idle : occures when there are no training sessions for a bot
   * done : when a training is complete
   * needs-training : when current chatbot model differs from training data
   * training-pending : when a training was launched, but the training process is not started yet
   * training: when a chatbot is currently training
   * canceled: when a user cancels a training and the training is being canceled
   * errored: when a chatbot failed to train
   */
  export type TrainingStatus =
    | 'idle'
    | 'done'
    | 'needs-training'
    | 'training-pending'
    | 'training'
    | 'canceled'
    | 'errored'
    | null

  export interface TrainingSession {
    key: string
    status: TrainingStatus
    language: string
    progress: number
  }

  export type EntityType = 'system' | 'pattern' | 'list'

  export interface EntityDefOccurrence {
    name: string
    synonyms: string[]
  }

  export interface EntityDefinition {
    id: string
    name: string
    type: EntityType
    sensitive?: boolean
    matchCase?: boolean
    examples?: string[]
    fuzzy?: number
    occurrences?: EntityDefOccurrence[]
    pattern?: string
  }

  export interface SlotDefinition {
    id: string
    name: string
    entities: string[]
    color: number
  }

  export interface IntentDefinition {
    name: string
    utterances: {
      [lang: string]: string[]
    }
    slots: SlotDefinition[]
    contexts: string[]
  }

  export interface Intent {
    name: string
    confidence: number
    context: string
  }

  export interface Entity {
    name: string
    type: string
    meta: EntityMeta
    data: EntityBody
  }

  export interface EntityBody {
    extras?: any
    value: any
    unit: string
  }

  export interface EntityMeta {
    sensitive: boolean
    confidence: number
    provider?: string
    source: string
    start: number
    end: number
    raw?: any
  }

  export interface Slot {
    name: string
    value: any
    source: any
    entity: Entity | null
    confidence: number
    start: number
    end: number
  }

  export interface SlotCollection {
    [key: string]: Slot
  }

  export interface ContextPrediction {
    confidence: number
    oos: number
    intents: {
      label: string
      confidence: number
      slots: NLU.SlotCollection
      extractor: string
    }[]
  }
}

export namespace IO {
  export type EventDirection = 'incoming' | 'outgoing'

  /**
   * These are the arguments required when creating a new {@link Event}
   */
  interface EventCtorArgs {
    type: string
    channel: string
    target: string
    direction: EventDirection
    preview?: string
    payload: any
    threadId?: string
    botId: string
    suggestions?: Suggestion[]
    credentials?: any
    nlu?: Partial<EventUnderstanding>
    incomingEventId?: string
    debugger?: boolean
    messageId?: string
  }

  /**
   * A BotpressEvent is how conversational channels interact with Botpress. Events represent all the interactions
   * that make up a conversation. That means the different message types (text, image, buttons, carousels etc) but also
   * the navigational events (chat open, user typing) and contextual events (user returned home, order delivered).
   */
  export type Event = EventDestination & {
    /** A sortable unique identifier for that event (time-based) */
    readonly id: string
    /** Id of the corresponding message in the messaging server */
    messageId?: string
    /** The type of the event, i.e. image, text, timeout, etc */
    readonly type: string
    /** Is it (in)coming from the user to the bot or (out)going from the bot to the user? */
    readonly direction: EventDirection
    /** The channel-specific raw payload */
    readonly payload: any
    /** A textual representation of the event */
    readonly preview: string
    /** The date the event was created */
    readonly createdOn: Date
    readonly credentials?: any
    /** When false, some properties used by the debugger are stripped from the event before storing */
    debugger?: boolean
    activeProcessing?: ProcessingEntry
    /** Track processing steps during the lifetime of the event  */
    processing?: {
      [activity: string]: ProcessingEntry
    }
    /**
     * Check if the event has a specific flag
     * @param flag The flag symbol to verify. {@link IO.WellKnownFlags} to know more about existing flags
     * @returns Return whether or not the event has the flag
     * @example event.hasFlag(bp.IO.WellKnownFlags.SKIP_DIALOG_ENGINE)
     */
    hasFlag(flag: symbol): boolean
    /**
     * Sets a flag on the event so it can be intercepted and properly handled if the case applies
     * @param flag The flag symbol to set. {@link IO.WellKnownFlags}
     * @param value The value of the flag.
     * @example event.setFlag(bp.IO.WellKnownFlags.SKIP_DIALOG_ENGINE, true)
     */
    setFlag(flag: symbol, value: boolean): void
  }

  export interface ProcessingEntry {
    logs?: string[]
    errors?: EventError[]
    date?: Date
  }

  /**
   * The EventDestination includes all the required parameters to correctly dispatch the event to the correct target
   */
  export interface EventDestination {
    /** The channel of communication, i.e web, messenger, twillio */
    readonly channel: string
    /** Who will receive this message, usually a user id */
    readonly target: string
    /** The id of the bot on which this event is relating to  */
    readonly botId: string
    /** The id of the thread this message is relating to (only on supported channels) */
    readonly threadId?: string
  }

  export interface EventUnderstanding {
    readonly errored: boolean
    readonly modelId: string | undefined

    readonly predictions?: {
      [context: string]: {
        confidence: number
        oos: number
        intents: {
          label: string
          confidence: number
          slots: NLU.SlotCollection
          extractor: string
        }[]
      }
    }

    // election
    readonly entities?: NLU.Entity[]
    readonly intent?: NLU.Intent
    readonly intents?: NLU.Intent[]
    readonly ambiguous?: boolean /** Predicted intents needs disambiguation */
    readonly slots?: NLU.SlotCollection
    readonly spellChecked?: string

    // pre-prediction
    readonly detectedLanguage:
      | string
      | undefined /** Language detected from users input. If undefined, detection failed. */
    readonly language: string /** The language used for prediction */
    readonly includedContexts: string[]
    readonly ms: number
  }

  export interface IncomingEvent extends Event {
    /** Array of possible suggestions that the Decision Engine can take  */
    readonly suggestions?: Suggestion[]
    /** Contains data related to the state of the event */
    state: EventState
    /** Holds NLU extraction results (when the event is natural language) */
    readonly nlu?: EventUnderstanding
    /** The final decision that the Decision Engine took */
    readonly decision?: Suggestion
    /* HITL module has possibility to pause conversation */
    readonly isPause?: boolean
  }

  export interface OutgoingEvent extends Event {
    /* Id of event which is being replied to; only defined for outgoing events */
    readonly incomingEventId?: string
  }

  export interface Suggestion {
    /** Number between 0 and 1 indicating how confident the module is about its suggestion */
    confidence: number
    /** An array of the raw payloads to send as an answer */
    payloads: any[]
    /** The source (usually the name of the module or core component) this suggestion is coming from */
    source: string
    /** More specific details from the source of the suggestion, e.g. the name of the QnA */
    sourceDetails?: string
    /** The Decision Engine's decision about this suggestion */
    decision: {
      status: 'dropped' | 'elected'
      reason: string
    }
  }

  /**
   * This  object is used to store data which will be persisted on different timeframes. It allows you to easily
   * store and retrieve data for different kind of situations.
   */
  export interface EventState {
    /** Data saved as user attributes; retention policies in Botpress global config applies  */
    user: any
    /** Data is kept for the active session. Timeout configurable in the global config file */
    session: CurrentSession
    /** Data saved to this variable will be remembered until the end of the flow */
    temp: any
    /**
     * Variables in the bot object are shared to all users for a specific bot. It is read only,
     * meaning that changes are not automatically persisted. You need to use the setVariable option to change it.
     * There is a possible race condition since it is loaded each time a messages comes in. Update it wisely
     */
    bot: any
    /** Used internally by Botpress to keep the user's current location and upcoming instructions */
    context?: DialogContext
    /**
     * EXPERIMENTAL
     * This includes all the flow/nodes which were traversed for the current event
     */
    __stacktrace: JumpPoint[]
  }

  export interface EventError {
    type: 'action-execution' | 'dialog-transition' | 'dialog-engine' | 'hook-execution'
    stacktrace?: string
    actionName?: string
    actionArgs?: any
    hookName?: string
    destination?: string
    /** Represent the location where the error was triggered  */
    flowName?: string
    nodeName?: string
  }

  export interface JumpPoint {
    /** The name of the previous flow to return to when we exit a subflow */
    flow: string
    /** The name of the previous node to return to when we exit a subflow */
    node: string
    /** When a jump point is used, it will be removed from the list on the next transition */
    used?: boolean
    /** When true, the node targeted by this jump point will be executed from the start (instead of only transitions) */
    executeNode?: boolean
  }

  export interface DialogContext {
    /** The name of the previous flow to return to when we exit a subflow */
    previousFlow?: string
    /** The name of the previous node to return to when we exit a subflow */
    previousNode?: string
    /** The name of the current active node */
    currentNode?: string
    /** The name of the current active flow */
    currentFlow?: string
    /** An array of jump-points to return when we exit subflow */
    jumpPoints?: JumpPoint[]
    /** The instructions queue to be processed by the dialog engine */
    queue?: any
    /**
     * Indicate that the context has just jumped to another flow.
     * This is used to execute the target flow catchAll transitions.
     */
    hasJumped?: boolean
  }

  export interface CurrentSession {
    lastMessages: DialogTurnHistory[]
    nluContexts?: NluContext[]
    // Prevent warnings when using the code editor with custom properties
    [anyKey: string]: any
  }

  export type StoredEvent = {
    /** This ID is automatically generated when inserted in the DB  */
    readonly id: string
    readonly messageId?: string
    direction: EventDirection
    /** Outgoing events will have the incoming event ID, if they were triggered by one */
    incomingEventId?: string
    type: string
    sessionId: string
    workflowId?: string
    feedback?: number
    success?: boolean
    event: IO.Event
    createdOn: any
  } & EventDestination

  /**
   * They represent the contexts that will be used by the NLU Engine for the next messages for that chat session.
   *
   * The TTL (Time-To-Live) represents how long the contexts will be valid before they are automatically removed.
   * For example, the default value of `1` will listen for that context only once (the next time the user speaks).
   *
   * If a context was already present in the list, the higher TTL will win.
   */
  export interface NluContext {
    context: string
    /** Represent the number of turns before the context is removed from the session */
    ttl: number
  }

  export interface DialogTurnHistory {
    eventId: string
    incomingPreview: string
    replySource: string
    replyPreview: string
    replyConfidence: number
    replyDate: Date
  }

  /**
   * Call next with an error as first argument to throw an error
   * Call next with true as second argument to swallow the event (i.e. stop the processing chain)
   * Call next with no parameters or false as second argument to continue processing to next middleware
   * Call next with the last parameter as true to mark the middleware as "skipped" in the event processing
   */
  export type MiddlewareNextCallback = (error?: Error, swallow?: boolean, skipped?: boolean) => void

  /**
   * The actual middleware function that gets executed. It receives an event and expects to call next()
   * Not calling next() will result in a middleware timeout and will stop processing
   * If you intentionally want to stop processing, call `next(null, false)`
   */
  export type MiddlewareHandler = (event: Event, next: MiddlewareNextCallback) => void

  /**
   * The Middleware Definition is used by the event engine to register a middleware in the chain. The order in which they
   * are executed is important, since some may require previous processing, while others can swallow the events.
   * Incoming chain is executed when the bot receives an event.
   * Outgoing chain is executed when an event is sent to a user
   */
  export interface MiddlewareDefinition {
    /** The internal name used to identify the middleware in configuration files */
    name: string
    description: string
    /** The position in which this middleware should intercept messages in the middleware chain. */
    order: number
    /** A method with two parameters (event and a callback) used to handle the event */
    handler: MiddlewareHandler
    /** Indicates if this middleware should act on incoming or outgoing events */
    direction: EventDirection
    /**
     * Allows to specify a timeout for the middleware instead of using the middleware chain timeout value
     * @example '500ms', '2s', '5m'
     * @default '2s'
     * */
    timeout?: string
  }

  export interface EventConstructor {
    (args: EventCtorArgs): Event
  }
}

export interface User {
  id: string
  channel: string
  createdOn: Date
  updatedOn: Date
  attributes: any
  otherChannels?: User[]
}

/**
 * The direction of the event. An incoming event will register itself into the incoming middleware chain.
 * An outgoing event will register itself into the outgoing middleware chain.
 * @see MiddlewareDefinition to learn more about middleware.
 */
export type EventDirection = 'incoming' | 'outgoing'

export interface UpsertOptions {
  /** Whether or not to record a revision @default true */
  recordRevision?: boolean
  /** When enabled, files changed on the database are synced locally so they can be used locally (eg: require in actions) @default false */
  syncDbToDisk?: boolean
  /** This is only applicable for bot-scoped ghost. When true, the lock status of the bot is ignored. @default false */
  ignoreLock?: boolean
}

export interface DirectoryListingOptions {
  excludes?: string | string[]
  includeDotFiles?: boolean
  sortOrder?: SortOrder & { column: 'filePath' | 'modifiedOn' }
}

export interface ListenHandle {
  /** Stops listening from the event */
  remove(): void
}

/**
 * The configuration definition of a bot.
 */
export interface BotConfig {
  $schema?: string
  id: string
  name: string
  description?: string
  category?: string
  details: BotDetails
  author?: string
  disabled?: boolean
  private?: boolean
  /**
   * When true, the studio considers the bot as "standalone"
   * - Auth Gate is available
   * - We provide the runtime sdk instead of the full sdk
   * - We add hooks create short links
   */
  standalone?: boolean
  version: string
  imports: {
    /** Defines the list of content types supported by the bot */
    contentTypes: string[]
  }
  messaging?: MessagingConfig
  converse?: ConverseConfig
  dialog?: BotDialogConfig
  logs?: BotLogsConfig
  defaultLanguage: string
  languages: string[]
  locked: boolean
  pipeline_status: BotPipelineStatus
  qna: {
    disabled: boolean
  }
  skillChoice: {
    /**
     * @default true
     */
    matchNumbers: boolean
    /**
     * @default true
     */
    matchNLU: boolean
  }
  skillSendEmail: {
    /**
     * Nodemailer2 transport connection string.
     * @see https://www.npmjs.com/package/nodemailer2
     *
     * Alternatively, you can pass an object with any required parameters
     * @see https://nodemailer.com/smtp/#examples
     *
     * @example smtps://user%40gmail.com:pass@smtp.gmail.com
     * @default <<change me>>
     */
    transportConnectionString: string
  }

  /**
   * constant number used to seed nlu random number generators
   * if not set, seed is computed from botId
   */
  nluSeed?: number
  nluModels?: {
    [lang: string]: string
  }

  cloud?: CloudConfig
  isCloudBot?: boolean
}

export interface CloudConfig {
  clientId: string
  clientSecret: string
}

export type Pipeline = Stage[]

export type StageAction = 'promote_copy' | 'promote_move'

export interface Stage {
  id: string
  label: string
  action: StageAction
}

export interface BotPipelineStatus {
  current_stage: {
    promoted_by: string
    promoted_on: Date
    id: string
  }
  stage_request?: {
    requested_on: Date
    expires_on?: Date
    message?: string
    status: string
    requested_by: string
    id: string
    approvals?: StageRequestApprovers[]
  }
}

export interface StageRequestApprovers {
  email: string
  strategy: string
}

export interface BotDetails {
  website?: string
  phoneNumber?: string
  termsConditions?: string
  privacyPolicy?: string
  emailAddress?: string
  avatarUrl?: string
  coverPictureUrl?: string
}

export interface BotLogsConfig {
  expiration: string
}

/**
 * Configuration definition of Dialog Sessions
 */
export interface BotDialogConfig {
  /** The interval until a session context expires */
  timeoutInterval: string
  /** The interval until a session expires */
  sessionTimeoutInterval: string
}

export interface MessagingConfig {
  /**
   * Configurations of channels to be sent to the messaging server
   * You can find more about channel configurations here : https://botpress.com/docs/channels/faq
   */
  channels: { [channelName: string]: any }
}

/**
 * Configuration file definition for the Converse API
 */
export interface ConverseConfig {
  /**
   * The timeout of the converse API requests
   * @default 5s
   */
  timeout: string
  /**
   * The text limitation of the converse API requests
   * @default 360
   */
  maxMessageLength: number
  /**
   * Number of milliseconds that the converse API will wait to buffer responses
   * @default 250
   */
  bufferDelayMs: number
  /**
   * Whether or not you want to expose public converse API. See docs here https://botpress.com/docs/channels/converse#public-api
   * @default ture
   */
  enableUnsecuredEndpoint: boolean
}

export interface ParsedContentType {
  id: ContentType['id']
  count: number
  title: ContentType['title']
  hidden: ContentType['hidden']
  schema: {
    json: ContentType['jsonSchema']
    ui: ContentType['uiSchema']
    title: ContentType['title']
    renderer: ContentType['id']
  }
}

/**
 * A Content Element is a single item of a particular Content Type @see ContentType.
 * Content Types contains many Elements. An Element belongs to a single Content Type.
 */
export interface ContentElement {
  id: string
  /** The Id of the Content Type for which the Element belongs to. */
  contentType: string
  /** The raw form data that contains templating that needs to be interpreted. */
  formData: FormData
  /** The computed form data that contains the interpreted data. */
  computedData: object
  /** The textual representation of the Content Element, for each supported languages  */
  previews: object
  createdOn: Date
  modifiedOn: Date
  createdBy: string
  schema?: ParsedContentType['schema']
  botId?: string
}

/**
 * A Content Type describes a grouping of Content Elements @see ContentElement sharing the same properties.
 * They can describe anything and everything – they most often are domain-specific to your bot. They also
 * tells botpress how to display the content on various channels
 */
export interface ContentType {
  id: string
  title: string
  group?: string
  description?: string
  /**
   * Hiding content types prevents users from adding these kind of elements via the Flow Editor.
   * They are still visible in the Content Manager, and it's still possible to use these elements by specifying
   * their name as a property "contentType" to ContentPickerWidget.
   */
  hidden?: boolean
  /**
   * The jsonSchema used to validate the form data of the Content Elements.
   */
  jsonSchema: object
  uiSchema?: object

  /**
   * Function that defines how a Content Type gets rendered on different channels.
   * This function resides in the javascript definition of the Content Type.
   *
   * @param data The data required to render the Content Elements. e.g. Text, images, button actions, etc.
   * @param channel The channel used to communicate, e.g. channel-web, messenger, twilio, etc.
   * @returns Return an array of rendered Content Elements
   */
  renderElement: (data: object, channel: string) => object[] | object
  /**
   * Function that computes the visual representation of the text.
   * This function resides in the javascript definition of the Content Type.
   */
  computePreviewText?: (formData: any) => string
}

export type CustomContentType = Omit<Partial<ContentType>, 'id'> & {
  /** A custom component must extend a builtin type */
  extends: string
}

/**
 * The flow is used by the dialog engine to answer the user and send him to the correct destination
 */
export interface Flow {
  name: string
  /** Friendly name to display in the flow view */
  label?: string
  description?: string
  location?: string
  version?: string
  /** This is the home node. The user will be directed there when he enters the flow */
  startNode: string
  /** An object containing all the properties required to edit a skill */
  skillData?: any
  /** An array of all the nodes included in the flow */
  nodes: FlowNode[]
  /** Those actions are attached to the flow and can be triggered regardless of the user's current node */
  catchAll?: NodeActions
  /** The name of the node to send the user if he reaches the timeout threshold */
  timeoutNode?: string
  type?: string
  timeout?: { name: string; flow: string; node: string }[]
}

export interface Option {
  value: string
  label: string
}

/**
 * This interface is used to encapsulate the logic around the creation of a new skill. A skill
 * is a subflow which can have multiple nodes and custom logic, while being hidden under a single node in the main flow.
 * The node transitions specified here are applied on the node in the main flow. Once the user enters the node,
 * the flow takes over
 */
export interface FlowGenerationResult {
  /**
   * A partial flow originating from a skill flow generator. Missing pieces will be automatically added
   * once the flow is sent to Botpress, the final product will be a Flow.
   */
  flow: SkillFlow
  /** An array of possible transitions for the parent node */
  transitions: NodeTransition[]
}

/**
 * The partial flow is only used to make some nodes optional. Those left empty will be automatically
 * generated by the skill service.
 */
export type SkillFlow = Partial<Flow> & Pick<Required<Flow>, 'nodes'>

export type FlowNodeType = 'standard' | 'skill-call' | 'listen' | 'say_something' | 'execute' | 'router' | 'action'

export type FlowNode = {
  id?: string
  name: string
  type?: FlowNodeType
  timeoutNode?: string
  flow?: string
  /** Used internally by the flow editor */
  readonly lastModified?: Date
} & NodeActions

/**
 * Node Transitions are all the possible outcomes when a user's interaction on a node is completed. The possible destinations
 * can be any node: a node in the same flow, one in a subflow, return to the parent flow, end discussion... etc.
 * There are special nodes:
 * - # - Send the user to the previous flow, at the calling node
 * - #node - Send the user to the previous flow, at a specific node
 * - ## - Send the user to the starting node of the previous flow
 * - END - End the current dialog
 * - node - Send the user to a specific node in the current flow
 */
export interface NodeTransition {
  /** The text to display instead of the condition in the flow editor */
  caption?: string
  /** A JS expression that is evaluated to determine if it should send the user to the specified node */
  condition: string
  /** The destination node */
  node: string
}

export interface MultiLangText {
  [lang: string]: string
}

export type FormDataField = any

export interface FormData {
  id?: string
  contentType?: string
  [key: string]: FormDataField
}

export interface FormOption {
  value: any
  label: string
  related?: FormField
}

interface FormContextMenu {
  type: string
  label: string
}

// TODO use namespace to group form related interfaces
export interface FormDynamicOptions {
  /** An enpoint to call to get the options */
  endpoint: string
  /** Used with _.get() on the data returned by api to get to the list of items */
  path?: string
  /** Field from DB to map as the value of the options */
  valueField: string
  /** Field from DB to map as the label of the options */
  labelField: string
}

export type FormFieldType =
  | 'checkbox'
  | 'group'
  | 'number'
  | 'overridable'
  | 'select'
  | 'multi-select'
  | 'text'
  | 'text_array'
  | 'textarea'
  | 'upload'
  | 'url'
  | 'hidden'
  | 'tag-input'
  | 'variable'

export interface FormField {
  type: FormFieldType
  key: string
  label?: string
  overrideKey?: string
  placeholder?: string | string[]
  emptyPlaceholder?: string
  options?: FormOption[]
  defaultValue?: FormDataField
  required?: boolean
  variableTypes?: string[]
  customPlaceholder?: boolean
  max?: number
  min?: number
  maxLength?: number
  valueManipulation?: {
    regex: string
    modifier: string
    replaceChar: string
  }
  translated?: boolean
  dynamicOptions?: FormDynamicOptions
  fields?: FormField[]
  moreInfo?: FormMoreInfo
  /** When specified, indicate if array elements match the provided pattern */
  validation?: {
    regex?: RegExp
    list?: any[]
    validator?: (items: any[], newItem: any) => boolean
  }
  group?: {
    /** You have to specify the add button label */
    addLabel?: string
    addLabelTooltip?: string
    /** You can specify a minimum so the delete button won't show if there isn't more than the minimum */
    minimum?: number
    /** You can specify that there's one item of the group by default even if no minimum */
    defaultItem?: boolean
    /** You can add a contextual menu to add extra options */
    contextMenu?: FormContextMenu[]
  }
}

export interface FormMoreInfo {
  label: string
  url?: string
}

/**
 * A Node Action represent all the possible actions that will be executed when the user is on the node. When the user
 * enters the node, actions in the 'onEnter' are executed. If there are actions in 'onReceive', they will be called
 * once the user reply something. Transitions in 'next' are evaluated after all others to determine where to send
 */
export interface NodeActions {
  /** An array of actions to take when the user enters the node */
  onEnter?: ActionBuilderProps[] | string[]
  /** An array of actions to take when the user replies */
  onReceive?: ActionBuilderProps[] | string[]
  /** An array of possible transitions once everything is completed */
  next?: NodeTransition[]
  /** For node of type say_something, this contains the element to render */
  content?: {
    contentType: string
    /** Every properties required by the content type, including translations */
    formData: object
  }
}

export interface ActionBuilderProps {
  name: string
  type: NodeActionType
  args?: any
}

/**
 * The Node Action Type is used by the skill service to tell the dialog engine what action to take.
 */
export enum NodeActionType {
  RenderElement = 'render',
  RunAction = 'run',
  RenderText = 'say'
}

/**
 * The AxiosBotConfig contains the axios configuration required to call the api of another module.
 * @example: axios.get('/mod/module', axiosBotConfig)
 */
export interface AxiosBotConfig {
  /** The base url of the bot.
   * @example http://localhost:3000/
   */
  baseURL: string
  headers: {
    'CSRF-Token'?: string
    Authorization?: string
    'X-BP-Workspace'?: string
  }
}

/**
 * Simple interface to use when paging is required
 */
export interface Paging {
  /** The index of the first element */
  start: number
  /** How many elements should be returned */
  count: number
}

/**
 * All available rollout strategies (how users interact with bots of that workspace)
 * An invite code is permanent, meaning that it will be consumed once and will not be necessary for that user in the future
 *
 * anonymous: Anyone can talk to bots
 * anonymous-invite: Anyone with an invite code can talk to bots
 * authenticated: Authenticated users will be automatically added to workspace as "chat user" (will then be "authorized")
 * authenticated-invite: Authenticated users with an invite code will be added to workspace as "chat user" (will then be "authorized")
 * authorized: Only authenticated users with an existing access to the workspace can talk to bots
 */
export type RolloutStrategy = 'anonymous' | 'anonymous-invite' | 'authenticated' | 'authenticated-invite' | 'authorized'

export interface WorkspaceRollout {
  rolloutStrategy: RolloutStrategy
  inviteCode?: string
  allowedUsages?: number
}
export interface WorkspaceUser {
  email: string
  strategy: string
  role: string
  workspace: string
  workspaceName?: string
}

export type WorkspaceUserWithAttributes = {
  attributes: any
} & WorkspaceUser

export interface GetWorkspaceUsersOptions {
  attributes: string[] | '*'
  includeSuperAdmins: boolean
}

export interface WorkspaceUser {
  email: string
  strategy: string
  role: string
  workspace: string
  workspaceName?: string
}

export interface AddWorkspaceUserOptions {
  /** Select an existing custom role for that user. If role, asAdmin and asChatUser are undefined, then it will pick the default role */
  role?: string
  /** When enabled, user is added to the workspace as an admin (role is ignored) */
  asAdmin?: boolean
  /** When enabled, user is added as a chat user (role is ignored)  */
  asChatUser?: boolean
}

export interface Content {
  type: string
}

export interface TextContent extends Content {
  type: 'text'
  text: string | MultiLangText
  markdown?: boolean
}

export interface ImageContent extends Content {
  type: 'image'
  image: string
  title?: string | MultiLangText
}

export interface AudioContent extends Content {
  type: 'audio'
  audio: string
  title?: string | MultiLangText
}

export interface VideoContent extends Content {
  type: 'video'
  video: string
  title?: string | MultiLangText
}

export interface CarouselContent extends Content {
  type: 'carousel'
  items: CardContent[]
}

export interface CardContent extends Content {
  type: 'card'
  title: string | MultiLangText
  subtitle?: string | MultiLangText
  image?: string
  actions: ActionButton[]
}

export interface LocationContent extends Content {
  type: 'location'
  latitude: number
  longitude: number
  address?: string | MultiLangText
  title?: string | MultiLangText
}

export interface FileContentType extends Content {
  type: 'file'
  file: string
  title?: string | MultiLangText
}

export enum ButtonAction {
  SaySomething = 'Say something',
  OpenUrl = 'Open URL',
  Postback = 'Postback'
}

export interface ActionButton {
  action: ButtonAction
  title: string
}

export interface ActionSaySomething extends ActionButton {
  text: string | MultiLangText
}

export interface ActionOpenURL extends ActionButton {
  url: string
}

export interface ActionPostback extends ActionButton {
  payload: string
}

export interface ChoiceContent extends Content {
  type: 'single-choice'
  text: string | MultiLangText
  choices: ChoiceOption[]
}

export interface ChoiceOption {
  title: string | MultiLangText
  value: string
}

export interface DropdownContent extends Content {
  type: 'dropdown'
  message: string | MultiLangText
  options: DropdownOption[]
}

export interface DropdownOption {
  label: string | MultiLangText
  value: string
}

////////////////
//////// API
////////////////

// prettier-ignore
export type RouterCondition = boolean | ((req: any) => boolean)

/**
 * Those are possible options you may enable when creating new routers
 */
export interface RouterOptions {
  /**
   * Check if user is authenticated before granting access
   * @default true
   */
  checkAuthentication: RouterCondition

  /**
   * When checkAuthentication is enabled, set this to true to enforce permissions based on the method.
   * GET/OPTIONS requests requires READ permissions, while all other requires WRITE permissions
   * @default true
   */
  checkMethodPermissions?: RouterCondition

  /**
   * Parse the body as JSON when possible
   * @default true
   */
  enableJsonBodyParser?: RouterCondition

  /**
   * Only parses body which are urlencoded
   * @default true
   */
  enableUrlEncoderBodyParser?: RouterCondition
}

/**
 * Search parameters when querying content elements
 */
export interface SearchParams {
  /** Search in elements id and form data */
  searchTerm?: string
  /** Returns the amount of elements from the starting position  */
  from: number
  count: number
  /** Only returns the items matching these ID */
  ids?: string[]
  /** An array of columns with direction to sort results */
  sortOrder?: SortOrder[]
  /** Apply a filter to a specific field (instead of the 'search all' field) */
  filters?: Filter[]
}

export interface EventSearchParams {
  /** Returns the amount of elements from the starting position  */
  from?: number
  count?: number
  /** An array of columns with direction to sort results */
  sortOrder?: SortOrder[]
}

export interface Filter {
  /** The name of the column to filter on */
  column: string
  /** The value to filter (line %value%) */
  value: string
}

export interface SortOrder {
  /** The name of the column  */
  column: string
  /** Is the sort order ascending or descending? Asc by default */
  desc?: boolean
}

export interface AxiosOptions {
  /** When true, it will return the local url instead of the external url  */
  localUrl?: boolean
  /** Temporary property so modules can query studio routes */
  studioUrl?: boolean
}

export type uuid = string

export interface Conversation {
  id: uuid
  clientId: uuid
  userId: uuid
  createdOn: Date
}

export interface MessagingUser {
  id: uuid
  clientId: uuid
}

export interface Message {
  id: uuid
  conversationId: uuid
  authorId: uuid | undefined
  sentOn: Date
  payload: any
}

export interface Endpoint {
  channel:
    | {
        name: string
        version: string
      }
    | string
  identity: string
  sender: string
  thread: string
}

/**
 * A state is a mutable object that contains properties used by the dialog engine during a conversation.
 * Properties like "nickname" or "nbOfConversations" are used during a conversation to execute flow logic. e.g. Navigating to a certain node when a condition is met.
 */
export type State = any

export namespace cms {
  /**
   * Mustache template to render. Can contain objects, arrays, strings.
   * @example '{{en}}', ['{{nested.de}}'], {notSoNested: '{{fr}}'}
   */
  export type TemplateItem = Object | Object[] | string[] | string
}
