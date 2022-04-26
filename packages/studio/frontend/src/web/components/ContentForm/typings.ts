import { JSONSchema6 } from 'json-schema'
import { FormProps } from 'react-jsonschema-form'
import { SupportedFileType } from '../Shared/Form/FormFields/typings'

export type Schema = JSONSchema6 & {
  $subtype: 'ref' | 'flow' | SupportedFileType
  $filter: string
  $help: {
    text: string
    link?: string
  }
}

export interface FormData {
  [key: string]: string | boolean | Array<Object>
}

export type Fields = FormProps<FormData>['fields']
export type Widgets = FormProps<FormData>['widgets']
