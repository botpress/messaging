import { Service } from '@botpress/framework'
import _ from 'lodash'
import path from 'path'
import { FileService } from '../files/service'
import { PathService } from '../paths/service'

export class CmsService extends Service {
  private contentTypes!: any[]

  constructor(private paths: PathService, private files: FileService) {
    super()
  }

  async setup() {
    const contentTypesPathsWithUtils = await this.paths.listFiles('content-types')
    const contentTypesPaths = contentTypesPathsWithUtils.filter((x) => !path.basename(x).startsWith('_'))

    this.contentTypes = contentTypesPaths.map((x) => require(this.paths.absolute(x)).default)
  }

  async listTypes() {
    return this.contentTypes.map((x) => ({
      id: x.id,
      // TODO: count doesn't work
      count: undefined,
      title: x.title,
      hidden: x.hidden,
      schema: {
        json: x.jsonSchema,
        ui: x.uiSchema,
        title: x.title,
        renderer: x.id
      }
    }))
  }

  async listElements() {
    const contentElementsPerFile = await this.files.list('content-elements')
    const contentElements = []

    for (const file of contentElementsPerFile) {
      const contentTypeId = path.basename(file.path).replace('.json', '')
      const contentType = this.contentTypes.find((x) => x.id === contentTypeId)

      for (const element of file.content) {
        const previews = this.computeElementPreviews(element, contentType, 'en', ['en', 'fr']) // TODO: provide languages and default lang

        contentElements.push({
          ...element,
          contentType: contentTypeId,
          schema: {
            json: contentType.jsonSchema,
            ui: contentType.uiSchema,
            title: contentType.title,
            renderer: contentType.id
          },
          previews
        })
      }
    }

    return _.sortBy(contentElements, 'createdOn')
  }

  async updateElement(contentType: string, contentElement: any) {
    const filepath = `content-elements/${contentType}.json`
    const elements: any[] = await this.files.get(filepath)

    const newElements = [...elements.filter((x) => x.id !== contentElement.id), contentElement]
    await this.files.update(filepath, newElements)
  }

  async getElement(elementId: string) {
    // TODO: absolute dogshit performance over here!

    const elements = await this.listElements()
    return elements.find((x) => x.id === elementId)
  }

  async deleteElements(ids: string[]) {
    const contentElementsPerFile = await this.files.list('content-elements')

    await Promise.all(
      contentElementsPerFile.map((file) =>
        this.files.update(
          file.path,
          file.content.filter((x: any) => !ids.includes(x.id))
        )
      )
    )
  }

  private computeElementPreviews(element: any, contentType: any, defaultLanguage: string, languages: string[]): any[] {
    let recursiveProtection = 0

    const resolveRef = (data: any): any => {
      if (recursiveProtection++ >= 10) {
        return '[error: circular dependency]'
      }

      if (!data) {
        return data
      }

      if (Array.isArray(data)) {
        return data.map(resolveRef)
      }

      if (_.isObject(data)) {
        return _.mapValues(data, resolveRef)
      }

      if (_.isString(data)) {
        const m = data.match(/^##ref\((.*)\)$/)
        const refId = m?.[1]
        if (!refId || !element) {
          return data
        }
        return resolveRef(element.formData)
      }
    }

    const getOriginalProps = (expandedFormData: any, lang: string, contentType: any) => {
      const originalProps = Object.keys(_.get(contentType, 'jsonSchema.properties'))

      // When data is accessible through a single key containing the '$' separator. e.g. { 'text$en': '...' }
      const separatorExtraction = (prop: string) =>
        expandedFormData[`${prop}$${lang}`] || (defaultLanguage && expandedFormData[`${prop}$${defaultLanguage}`])

      // When data is accessible through keys of a nested dictionary. e.g. { 'text': { 'en': '...' } }
      const nestedDictExtraction = (prop: string) =>
        expandedFormData[prop] &&
        (expandedFormData[prop][lang] || (defaultLanguage && expandedFormData[prop][defaultLanguage]))

      if (originalProps) {
        return originalProps.reduce(
          (result: any, prop) => ((result[prop] = separatorExtraction(prop) || nestedDictExtraction(prop)), result),
          {}
        )
      } else {
        return expandedFormData
      }
    }

    const host = process.env.EXTERNAL_URL || 'http://localhost:3300' // TODO: Use env var instead of hardcoded value
    const context = { BOT_ID: '', BOT_URL: host }

    recursiveProtection = 0 // reset recursive counter that prevents circular dependencies between elements
    const expandedFormData = resolveRef(element.formData)

    const previews = languages.reduce((result: any, lang) => {
      if (!contentType || !contentType.computePreviewText) {
        result[lang] = 'No preview'
        return result
      }

      const translated = getOriginalProps(expandedFormData, lang, contentType)
      let preview = contentType.computePreviewText({ ...translated, ...context })

      if (!preview) {
        const defaultTranslation = getOriginalProps(expandedFormData, defaultLanguage, contentType)
        preview = `(missing translation) ${contentType.computePreviewText({
          ...defaultTranslation,
          ...context
        })}`
      }

      result[lang] = preview
      return result
    }, {})

    return previews
  }
}
