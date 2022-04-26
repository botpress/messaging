import _ from 'lodash'

interface NodeData {
  formData?: any
  contentType?: any
}

export const getFormData = (
  node: NodeData,
  contentLang: string,
  defaultLanguage: string,
  defaultValue: any = {}
): any => {
  if (!node?.formData) {
    return defaultValue
  }

  const translatedData = getFormDataForLang(node, contentLang)
  if (isFormEmpty(translatedData)) {
    return getFormDataForLang(node, defaultLanguage)
  }

  return translatedData
}

export const isFormEmpty = (formData) => Object.values(formData).every(consideredEmtpyValue)

const consideredEmtpyValue = (value: any) => {
  // Undefined, booleans and array of empty obj are considered empty
  const isArrayOfEmptyObject = _.isArray(value) && value.every(_.isEmpty)
  return !value || _.isBoolean(value) || isArrayOfEmptyObject
}

const getFormDataForLang = (contentItem: NodeData, language: string) => {
  const { formData, contentType } = contentItem
  // Note Sept 28th 2021
  // I have tested a few scenarios and contentType is never defined.
  // I left this check there in case there is a reason for it
  const returnedContentType = contentType ? { contentType } : {}

  const languageKeys = Object.keys(formData).filter((x) => x.includes('$' + language))

  const data: any = languageKeys.reduce((obj, key) => {
    obj[key.replace('$' + language, '')] = formData[key]
    return obj
  }, {})

  return { ...data, ...returnedContentType }
}
