import * as sdk from '@botpress/sdk'
import _ from 'lodash'
import { DialogStep, Scenario } from './typings'

export const convertLastMessages = (
  lastMessages: sdk.IO.DialogTurnHistory[],
  eventId?: string
): DialogStep | undefined => {
  if (!lastMessages) {
    return undefined
  }
  const lastConversation = eventId ? lastMessages.filter((x) => x.eventId === eventId) : lastMessages

  if (!lastConversation.length) {
    return undefined
  }

  return {
    userMessage: lastConversation[0].incomingPreview,
    botReplies: lastConversation.map((x) => {
      return {
        botResponse: x.replyPreview,
        replySource: x.replySource
      }
    })
  }
}

export const buildScenarioFromEvents = (events: sdk.IO.StoredEvent[]): Scenario => {
  const scenario: Partial<Scenario> = {
    steps: [],
    // Since we don't have the real initial state (beforeIncomingMiddleware), we force a new one
    initialState: undefined,
    finalState: (_.last(events)?.event as sdk.IO.IncomingEvent).state
  }

  for (const event of events) {
    const incoming = event.event as sdk.IO.IncomingEvent

    const interactions = convertLastMessages(incoming.state.session.lastMessages, event.incomingEventId)
    if (interactions) {
      scenario.steps!.push(interactions)
    }
  }

  return _.omit(scenario, [
    'finalState.session.lastMessages',
    'finalState.context.jumpPoints',
    'finalState.context.queue'
  ])
}

export const getMappingFromVisitor = async (
  database: sdk.KnexExtended,
  logger: sdk.Logger,
  botId: string,
  visitorId: string
): Promise<string | undefined> => {
  try {
    const rows = await database('web_user_map').where({ botId, visitorId })

    if (rows?.length) {
      const mapping = rows[0]

      return mapping.userId
    }
  } catch (err) {
    logger.error('An error occurred while fetching a visitor mapping.', err)

    return undefined
  }
}
