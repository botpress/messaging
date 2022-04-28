import { extractElectedIntentSlot } from './natural-election'
import { fakeEventUnderstanding } from './tests/fakeEventUnderstanding'
import { NLU as NLUSDK } from 'botpress/runtime-sdk'
import _ from 'lodash'

describe('naturalElection', () => {
  describe('extractElectedIntentSlot', () => {
    it("should return input directly if the 'predictions' property is nil", () => {
      const input = fakeEventUnderstanding({ predictions: undefined })
      const result = extractElectedIntentSlot(input)
      expect(result).toStrictEqual(input)
    })

    it("should return input directly if the 'intent' property is nil", () => {
      const input = fakeEventUnderstanding({ predictions: {}, intent: undefined })
      const result = extractElectedIntentSlot(input)
      expect(result).toStrictEqual(input)
    })

    it("should return input directly if the 'context' property of the 'predictions' property is nil", () => {
      const contextA = undefined
      const input = fakeEventUnderstanding({
        predictions: { contextA: contextA as any },
        intent: { confidence: 1, context: 'contextA', name: 'name' }
      })
      const result = extractElectedIntentSlot(input)
      expect(result).toStrictEqual(input)
    })

    it("should return input with an empty 'slots' object if no labels within the 'intents' array match the 'intent' name", () => {
      const input = fakeEventUnderstanding({
        predictions: {
          contextA: {
            intents: [{ label: 'name', confidence: 1, extractor: 'extractor', slots: {} }],
            confidence: 1,
            oos: 1
          }
        },
        intent: { confidence: 1, context: 'contextA', name: 'label' }
      })
      const result = extractElectedIntentSlot(input)
      expect(result).toStrictEqual({ ...input, slots: {} })
    })

    it("should return input with the 'slots' object filled with that of the elected intent if a label within the 'intents' array matches the 'intent' name", () => {
      const slot: NLUSDK.Slot = {
        name: 'name',
        value: 'someValue',
        source: 'someSource',
        entity: null,
        confidence: 1,
        start: 1,
        end: 2
      }
      const input = fakeEventUnderstanding({
        predictions: {
          contextA: {
            intents: [{ label: 'name', confidence: 1, extractor: 'extractor', slots: { mySlot: slot } }],
            confidence: 1,
            oos: 1
          }
        },
        intent: { confidence: 1, context: 'contextA', name: 'name' }
      })
      const result = extractElectedIntentSlot(input)
      expect(result).toStrictEqual({ ...input, slots: { mySlot: slot } })
    })
  })
})
