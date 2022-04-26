import { ContentType } from 'botpress/sdk'
import base from './_base'
import utils from './_utils'
import { cardSchema } from './card'

const contentType: ContentType = {
  id: 'builtin_carousel',
  group: 'Built-in Messages',
  title: 'contentTypes.carousel.title',

  jsonSchema: {
    description: 'contentTypes.carousel.description',
    type: 'object',
    required: ['items'],
    properties: {
      items: {
        type: 'array',
        title: 'contentTypes.carousel.cards',
        items: cardSchema
      },
      ...base.typingIndicators
    }
  },
  computePreviewText: (formData) => formData.items && `Carousel: (${formData.items.length}) ${formData.items[0].title}`,
  renderElement: (data) => utils.extractPayload('carousel', data)
}

export default contentType
