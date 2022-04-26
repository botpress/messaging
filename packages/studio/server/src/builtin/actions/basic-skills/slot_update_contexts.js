/**
 * @typedef {Object} IntentDefinition
 * @property {string} name
 * @property {Object[]} slots
 * @property {string[]} contexts
 * @property {Object} utterances
 */

/**
 * retreives the intent definition from the ghost
 * @hidden true
 * @param {string} intentName The name of the intent to get contexts from
 * @returns {Promise<IntentDefinition>} intent
 */
const readIntentFromGhost = (intentName) =>
  bp.ghost.forBot(event.botId).readFileAsObject('intents', `${intentName}.json`)

/**
 * Update the session nluContexts for a specific intent
 * @hidden true
 * @param {string} intentName The name of the intent to get contexts from
 */
const updateContexts = async (intentName) => {
  const intent = await readIntentFromGhost(intentName)
  const nluContexts = intent.contexts.map((context) => {
    return {
      context,
      ttl: 1000
    }
  })
  event.state.session.nluContexts = nluContexts
  temp.tryFillSlotCount = 1
  temp.extracted = false
  temp.notExtracted = false
  temp.valid = undefined
  temp.alreadyExtracted = false
}

return updateContexts(args.intentName)
