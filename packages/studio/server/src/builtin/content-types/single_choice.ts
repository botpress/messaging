import { ContentType } from 'botpress/sdk'
import base from './_base'
import utils from './_utils'

const contentType: ContentType = {
  id: 'builtin_single-choice',
  group: 'Built-in Messages',
  title: 'contentTypes.singleChoice.title',

  jsonSchema: {
    description: 'contentTypes.singleChoice.description',
    type: 'object',
    required: ['choices'],
    properties: {
      text: {
        type: 'string',
        title: 'message'
      },
      isDropdown: {
        type: 'boolean',
        title: 'Show as a dropdown'
      },
      dropdownPlaceholder: {
        type: 'string',
        title: 'Dropdown placeholder',
        default: 'Select...'
      },
      choices: {
        type: 'array',
        title: 'contentTypes.singleChoice.choice',
        minItems: 1,
        maxItems: 10,
        items: {
          type: 'object',
          required: ['title', 'value'],
          properties: {
            title: {
              description: 'contentTypes.singleChoice.itemTitle',
              type: 'string',
              title: 'Message'
            },
            value: {
              description: 'contentTypes.singleChoice.itemValue',
              type: 'string',
              title: 'Value'
            }
          }
        }
      },
      ...base.useMarkdown,
      disableFreeText: {
        type: 'boolean',
        title: 'contentTypes.disableFreeText',
        default: false
      },
      ...base.typingIndicators
    }
  },

  uiSchema: {
    text: {
      'ui:field': 'i18n_field',
      $subtype: 'textarea'
    },
    choices: {
      'ui:field': 'i18n_array'
    }
  },
  computePreviewText: (formData) =>
    formData.choices && formData.text && `Choices (${formData.choices.length}) ${formData.text}`,
  renderElement: (data) => utils.extractPayload('single-choice', data),
  hidden: true
}

export default contentType
