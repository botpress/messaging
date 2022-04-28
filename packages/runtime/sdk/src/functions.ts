import {
  BotConfig,
  ContentElement,
  ContentType,
  EventSearchParams,
  GetOrCreateResult,
  IO,
  KvsService,
  MessagingClient,
  Paging,
  ScopedGhostService,
  SearchParams,
  TemplateItem,
  User
} from './interfaces'

/**
 * Events is the base communication channel of the bot. Messages and payloads are a part of it,
 * and it is the only way to receive or send information. Each event goes through the whole middleware chain (incoming or outgoing)
 * before being received by either the bot or the user.
 */
export interface events {
  /**
   * Register a new middleware globally. They are sorted based on their declared order each time a new one is registered.
   * @param middleware - The middleware definition to register
   */
  registerMiddleware(middleware: IO.MiddlewareDefinition): void

  /** Removes the specified middleware from the chain. This is mostly used in case of a module being reloaded */
  removeMiddleware(middlewareName: string): void

  /**
   * Send an event through the incoming or outgoing middleware chain
   * @param event - The event to send
   */
  sendEvent(event: IO.Event): Promise<void>

  /**
   * Reply easily to any received event. It accepts an array of payloads
   * and will send a complete event with each payloads. It is often paired with
   * {@link cms.renderElement} to generate payload for a specific content type
   *
   * @param eventDestination - The destination to identify the target
   * @param payloads - One or multiple payloads to send
   */
  replyToEvent(eventDestination: IO.EventDestination, payloads: any[], incomingEventId?: string): void

  /**
   * Return the state of the incoming queue. True if there are any events(messages)
   * from the user waiting in the queue.
   * @param event - Current event in the action context, used to identify the queue
   */
  isIncomingQueueEmpty(event: IO.IncomingEvent): boolean

  /**
   * When Event Storage is enabled, you can use this API to query data about stored events. You can use multiple fields
   * for your query, but at least one is required.
   *
   * @param fields - One or multiple fields to add to the search query
   * @param searchParams - Additional parameters for the query, like ordering, number of rows, etc.
   */
  findEvents(fields: Partial<IO.StoredEvent>, searchParams?: EventSearchParams): Promise<IO.StoredEvent[]>

  /**
   * When Event Storage is enabled, you can use this API to update an event. You can use multiple fields
   * for your query, but at least one is required.
   *
   * @param id - The ID of the event to update
   * @param fields - Fields to update on the event
   */
  updateEvent(id: string, fields: Partial<IO.StoredEvent>): Promise<void>

  /**
   * Register the user feedback for a specific event. The type property is used to increment associated metrics
   * @param incomingEventId - The ID of the first event of the conversation
   * @param target - The ID of the user
   * @param feedback Either 1 or -1
   * @param type - For now, only supports qna & workflow
   * @return true if feedback was successfully saved
   */
  saveUserFeedback(incomingEventId: string, target: string, feedback: number, type?: string): Promise<boolean>
}

export interface users {
  /**
   * Returns an existing user or create a new one with the specified keys
   */
  getOrCreateUser(channel: string, userId: string, botId?: string): GetOrCreateResult<User>

  /**
   * Merge the specified attributes to the existing attributes of the user
   * @deprecated Please mutate `event.state.user` directly instead
   */
  updateAttributes(channel: string, userId: string, attributes: any): Promise<void>

  /**
   * Overwrite all the attributes of the user with the specified payload
   * @deprecated Please mutate `event.state.user` directly instead
   */
  setAttributes(channel: string, userId: string, attributes: any): Promise<void>
  getAllUsers(paging?: Paging): Promise<any>
  getUserCount(): Promise<any>
  getAttributes(channel: string, userId: string): Promise<any>
}

export interface io {
  Event: IO.EventConstructor
}

/**
 * The dialog engine is what processes conversations. It orchestrates the conversational flow logic.
 */
export interface dialog {
  /**
   * Create a session Id from an Event Destination
   * @param eventDestination The event used to create the Dialog Session Id
   */
  createId(eventDestination: IO.EventDestination): string
  /**
   * Calls the dialog engine to start processing an event.
   * @param event The event to be processed by the dialog engine
   */
  processEvent(sessionId: string, event: IO.IncomingEvent): Promise<IO.IncomingEvent>
  /**
   * Deletes a session
   * @param sessionId The Id of the session to delete
   * @param botId The Id of the bot to which the session is tied
   */
  deleteSession(sessionId: string, botId: string): Promise<void>

  /**
   * Jumps to a specific flow and optionally a specific node. This is useful when the default flow behavior needs to be bypassed.
   * @param sessionId The Id of the the current Dialog Session. If the session doesn't exists, it will be created with this Id.
   * @param event The event to be processed
   * @param flowName The name of the flow to jump to
   * @param nodeName The name of the optional node to jump to.
   * The node will default to the starting node of the flow if this value is omitted.
   */
  jumpTo(sessionId: string, event: IO.IncomingEvent, flowName: string, nodeName?: string): Promise<void>
}

/**
 * The Key Value Store is perfect to store any type of data as JSON.
 */
export interface kvs {
  /**
   * Access the KVS Service for a specific bot. Check the {@link ScopedGhostService} for the operations available on the scoped element.
   */
  forBot(botId: string): KvsService
}

export interface bots {
  getBotById(botId: string): Promise<BotConfig | undefined>
}

export interface ghost {
  /**
   * Access the Ghost Service for a specific bot. Check the {@link ScopedGhostService} for the operations available on the scoped element.
   */
  forBot(botId: string): ScopedGhostService
}

export interface cms {
  /**
   * Returns a single Content Element
   * @param botId - The ID of the bot
   * @param id - The element id
   * @param language - If language is set, it will return only the desired language with the base properties
   * @returns A content element
   */
  getContentElement(botId: string, id: string, language?: string): Promise<ContentElement>

  getContentElements(botId: string, ids: string[], language?: string): Promise<ContentElement[]>

  /**
   *
   * @param botId The ID of the bot
   * @param contentTypeId Filter entries on that specific content type
   * @param searchParams Additional search parameters (by default, returns 50 elements)
   * @param language When specified, only that language is returned with the original property (ex: text$en becomes text)
   */
  listContentElements(
    botId: string,
    contentTypeId?: string,
    searchParams?: SearchParams,
    language?: string
  ): Promise<ContentElement[]>

  getAllContentTypes(botId: string): Promise<ContentType[]>
  /**
   * Content Types can produce multiple payloads depending on the channel and the type of message. This method can generate
   * payloads for a specific content element or generate them for a custom payload.
   * They can then be sent to the event engine, which sends them through the outgoing middlewares, straight to the user
   *
   * @param contentId - Can be a ContentType (ex: "builtin_text") or a ContentElement (ex: "!builtin_text-s6x5c6")
   * @param args - Required arguments by the content type (or the content element)
   * @param eventDestination - The destination of the payload (to extract the botId and channel)
   *
   * @example const eventDestination = { target: 'user123', botId: 'welcome-bot', channel: 'web', threadId: 1 }
   * @example const payloads = await bp.cms.renderElement('builtin_text', {type: 'text', text: 'hello'}, eventDestination)
   * @example await bp.events.replyToEvent(eventDestination, payloads)
   *
   * @returns An array of payloads
   */
  renderElement(contentId: string, args: any, eventDestination: IO.EventDestination): Promise<object[]>

  /**
   * Render a template using Mustache template rendering.
   * Use recursive template rendering to extract nested templates.
   *
   * @param item TemplateItem to render
   * @param context Variables to use for the template rendering
   */
  renderTemplate(item: TemplateItem, context: any): TemplateItem
}

export interface messaging {
  forBot(botId: string): MessagingClient
}

/**
 * Utility security-related features offered to developers
 * to create more secure extensions.
 */
export interface security {
  /**
   * Creates a message signature, which can be used as proof that the message was created on Botpress backend
   * You can call this method twice to verify the authenticity of a message
   */
  getMessageSignature(message: string): Promise<string>
}
