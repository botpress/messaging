import { ContentType } from 'botpress/sdk'
import base from './_base'
import utils from './_utils'

const contentType: ContentType = {
  id: 'dropdown',
  group: 'Extensions',
  title: 'contentTypes.dropdown.title',

  jsonSchema: {
    title: 'contentTypes.dropdown.desc',
    type: 'object',
    required: ['message'],
    properties: {
      message: {
        type: 'string',
        title: 'Message'
      },
      buttonText: {
        type: 'string',
        title: 'contentTypes.dropdown.buttonText',
        description: 'contentTypes.dropdown.buttonDesc',
        default: ''
      },
      placeholderText: {
        type: 'string',
        title: 'contentTypes.dropdown.placeholderText',
        default: 'Select a choice'
      },
      options: {
        type: 'array',
        title: 'contentTypes.dropdown.optionsList',
        items: {
          type: 'object',
          required: ['label'],
          properties: {
            label: {
              description: 'contentTypes.dropdown.itemLabel',
              type: 'string',
              title: 'Label'
            },
            value: {
              description: 'contentTypes.dropdown.itemValue',
              type: 'string',
              title: 'Value'
            }
          }
        }
      },
      width: {
        type: 'number',
        title: 'contentTypes.dropdown.widthTitle',
        description: 'contentTypes.dropdown.widthDesc'
      },
      displayInKeyboard: {
        type: 'boolean',
        title: 'contentTypes.dropdown.asKeyboardTitle',
        description: 'contentTypes.dropdown.asKeyboardDesc',
        default: true
      },
      allowCreation: {
        type: 'boolean',
        title: 'contentTypes.dropdown.allowCreate'
      },
      allowMultiple: {
        type: 'boolean',
        title: 'contentTypes.dropdown.allowMultiple'
      },
      ...base.useMarkdown,
      ...base.typingIndicators
    }
  },
  uiSchema: {
    message: {
      'ui:field': 'i18n_field',
      $subtype: 'textarea'
    },
    buttonText: {
      'ui:field': 'i18n_field'
    },
    options: {
      'ui:field': 'i18n_array'
    }
  },
  computePreviewText: (formData) => formData.message && 'Dropdown: ' + formData.message,
  renderElement: (data) => utils.extractPayload('dropdown', data)
}

export default contentType
