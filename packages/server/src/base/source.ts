import { Endpoint } from '@botpress/messaging-channels'

/**
 * Indicates whether an action is performed due to a request made by
 * - a conduit (we receive a request from an external service such as Telegram)
 * - a socket (using a websocket connection)
 *
 * Knowing this allows messaging to avoid redundantly
 * streaming back an event to the service that made the request.
 */
export interface ActionSource {
  endpoint?: Endpoint
  socket?: { id: string }
}
