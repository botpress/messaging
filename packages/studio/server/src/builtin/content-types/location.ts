import { ContentType } from 'botpress/sdk'
import base from './_base'
import utils from './_utils'

const contentType: ContentType = {
  id: 'builtin_location',
  group: 'Built-in Messages',
  title: 'contentTypes.location.title',

  jsonSchema: {
    description: 'contentTypes.location.description',
    type: 'object',
    $subtype: 'location',
    required: ['latitude', 'longitude'],
    properties: {
      latitude: {
        type: 'number',
        title: 'contentTypes.location.latitude'
      },
      longitude: {
        type: 'number',
        title: 'contentTypes.location.longitude'
      },
      address: {
        type: 'string',
        title: 'contentTypes.location.address'
      },
      title: {
        type: 'string',
        title: 'contentTypes.location.label'
      },
      ...base.typingIndicators
    }
  },

  uiSchema: {},

  computePreviewText: (formData) => `${formData.latitude}° ${formData.longitude}°`,
  renderElement: (data) => utils.extractPayload('location', data)
}

export default contentType
