import * as sdk from 'botpress/sdk'

export const trimUtterances = (intent: sdk.NLU.IntentDefinition) => {
  for (const lang of Object.keys(intent.utterances)) {
    intent.utterances[lang] = intent.utterances[lang].map((u) => u.trim())
  }
}
