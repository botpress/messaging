import Joi from 'joi'

export const BOTID_REGEX = /^[A-Z0-9]+[A-Z0-9_-]{1,}[A-Z0-9]+$/i
export const isValidBotId = (botId: string): boolean => BOTID_REGEX.test(botId)

export const BotEditSchema = Joi.object().keys({
  name: Joi.string().allow('').max(50),
  category: Joi.string().allow(null),
  description: Joi.string().max(500).allow(''),
  disabled: Joi.bool(),
  private: Joi.bool(),
  defaultLanguage: Joi.string().min(2).max(3),
  languages: Joi.array().items(Joi.string().min(2).max(3)),
  details: {
    website: Joi.string().uri().optional().allow(''),
    termsConditions: Joi.string().uri().optional().allow(''),
    privacyPolicy: Joi.string().uri().optional().allow(''),
    phoneNumber: Joi.string().max(20).optional().allow(''),
    emailAddress: Joi.string().email().optional().allow(''),
    avatarUrl: Joi.string().optional().allow(''),
    coverPictureUrl: Joi.string().optional().allow('')
  }
})

export const FuzzyTolerance = {
  Loose: 0.65,
  Medium: 0.8,
  Strict: 1
}

const EntityDefOccurrenceSchema = Joi.object().keys({
  name: Joi.string().required(),
  synonyms: Joi.array().items(Joi.string())
})

export const EntityDefCreateSchema = Joi.object().keys({
  id: Joi.string().regex(/\t\s/gi, { invert: true }),
  name: Joi.string().required(),
  type: Joi.string().valid(['system', 'pattern', 'list']).required(),
  sensitive: Joi.boolean().default(false),
  fuzzy: Joi.number().default(FuzzyTolerance.Medium),
  matchCase: Joi.boolean(),
  examples: Joi.array().items(Joi.string()).default([]),
  occurrences: Joi.array().items(EntityDefOccurrenceSchema).default([]),
  pattern: Joi.string().default('').allow('')
})

export const SlotsCreateSchema = Joi.object().keys({
  name: Joi.string().required(),
  entities: Joi.array().items(Joi.string()).required(),
  color: Joi.number().required(),
  id: Joi.string().required()
})

export const IntentDefCreateSchema = Joi.object().keys({
  name: Joi.string().required(),
  utterances: Joi.object().pattern(/.*/, Joi.array().items(Joi.string())).default({}),
  slots: Joi.array().items(SlotsCreateSchema).default([]),
  contexts: Joi.array().items(Joi.string()).default(['global'])
})
