import { ContentType } from 'botpress/sdk'
import base from './_base'
import utils from './_utils'

const contentType: ContentType = {
  id: 'builtin_image',
  group: 'Built-in Messages',
  title: 'image',

  jsonSchema: {
    description: 'contentTypes.image.description',
    type: 'object',
    required: ['image'],
    properties: {
      image: {
        type: 'string',
        $subtype: 'image',
        $filter: '.jpg, .png, .jpeg, .gif, .bmp, .tif, .tiff|image/*',
        title: 'contentTypes.image.title'
      },
      title: {
        type: 'string',
        title: 'contentTypes.image.imageLabel',
        description: 'contentTypes.image.labelDesc'
      },
      ...base.typingIndicators
    }
  },

  uiSchema: {
    title: {
      'ui:field': 'i18n_field'
    }
  },

  computePreviewText: (formData) => {
    if (!formData.image) {
      return ''
    }

    const link = utils.formatURL(formData.BOT_URL, formData.image)
    const title = formData.title ? ' | ' + formData.title : ''

    if (utils.isUrl(link)) {
      const fileName = utils.extractFileName(formData.image)
      return `Image: [![${formData.title || ''}](<${link}>)](<${link}>) - (${fileName}) ${title}`
    } else {
      return `Expression: ${link}${title}`
    }
  },

  renderElement: (data) => utils.extractPayload('image', data)
}

export default contentType
