import fs from 'fs'
import glob from 'glob'
import { join } from 'path'
import TreeModel from 'tree-model'
import * as TJS from 'typescript-json-schema'

interface DocNodeData {
  key: string
  type: string | null
  link: string | null
  docs: string | null
}

type NulStr = string | null | undefined
type DocNode = TreeModel.Node<DocNodeData>
type RecurseGenerateTreeFn = (
  node: DocNode,
  entries: {
    [key: string]: TJS.DefinitionOrBoolean
  }
) => DocNode

const ARGS: TJS.PartialArgs = {
  required: true,
  // aliasRef: true,
  ignoreErrors: true
}
const ROOT_NAME = 'event'
const ROOT_TYPE = 'IO.IncomingEvent'

const files = glob.sync('../studio-be/src/sdk/*.ts')
const program = TJS.getProgramFromFiles(files)
const generator = TJS.buildGenerator(program, ARGS) as TJS.JsonSchemaGenerator
const schema = TJS.generateSchema(program, ROOT_TYPE, ARGS, [], generator)
if (!schema) {
  throw new Error('Schema not generated, cannot proceed')
}
const { properties, definitions } = schema
if (!properties || !definitions) {
  throw new Error('No properties or definitions, cannot proceed')
}

const linkDelimRegex = /\[\[(.+)\]\]/
const extractLink = (str: NulStr): string | null => {
  if (!str) {
    return null
  }
  const token = str.split('\n').pop()
  if (token) {
    const match = token.match(linkDelimRegex)
    if (match && match[1]) {
      return match[1]
    }
  }
  return null
}

const cleanDocs = (str: NulStr): string | null => {
  if (!str) {
    return null
  }
  str = str.replace(linkDelimRegex, '')
  str = str[str.length - 1] === '\n' ? str.slice(0, str.length - 1) : str
  return str
}

const snipRef = (str: NulStr): string => {
  if (!str) {
    return ''
  }
  return str.split('/').pop() || ''
}

const tree = new TreeModel()

const rootNode: DocNodeData = {
  key: ROOT_NAME,
  type: ROOT_TYPE,
  link: extractLink(schema?.description),
  docs: cleanDocs(schema?.description)
}

const root: DocNode = tree.parse(rootNode)

const recurseGenerateTree: RecurseGenerateTreeFn = (node, entries) => {
  Object.entries(entries).forEach((entry) => {
    const [key, value] = entry
    let tmpNode: DocNode = tree.parse({
      key,
      type: null,
      link: null,
      docs: null
    })
    if (typeof value === 'object' && Object.keys(value).length > 0) {
      //@ts-ignore
      const { description, type, $ref, enum: enumm } = value
      if (description) {
        tmpNode.model.link = extractLink(description)
        tmpNode.model.docs = cleanDocs(description)
      }

      if (enumm) {
        tmpNode.model.type = `Enum(${enumm.join(',')})`
      } else if (type) {
        switch (type) {
          case 'array':
            const items = value?.items as TJS.Definition
            if (items.$ref) {
              tmpNode.model.type = `${snipRef(items.$ref)}[]`
            } else {
              tmpNode.model.type = type
            }
            break
          case 'object':
            const { properties, additionalProperties } = value
            tmpNode.model.type = type
            if (properties) {
              tmpNode = recurseGenerateTree(tmpNode, properties)
            }
            if (additionalProperties && (additionalProperties as TJS.Definition).$ref) {
              const snippedRef = snipRef((additionalProperties as TJS.Definition).$ref)
              const tmpDesc = (definitions[snippedRef] as TJS.Definition).description
              tmpNode.model.type = `{key: ${snippedRef}}`
              tmpNode.addChild(
                tree.parse({
                  key: '*',
                  type: snippedRef,
                  link: extractLink(tmpDesc),
                  desc: cleanDocs(tmpDesc)
                })
              )
            }
            break
          default:
            tmpNode.model.type = type
        }
      } else if ($ref && typeof definitions[snipRef($ref)] === 'object') {
        tmpNode.model.type = snipRef($ref)
        tmpNode = recurseGenerateTree(tmpNode, (definitions[snipRef($ref)] as TJS.Definition).properties || {})
      }
    }
    node.addChild(tmpNode)
  })
  return node
}

function recurseGenerateFallback(node: any): any {
  let val: any = {}
  if (node.children) {
    val = node.children.reduce((accu: any, child: DocNode) => {
      if (child.children) {
        accu[child.key] = recurseGenerateFallback(child)
      } else {
        accu[child.key] = null
      }

      return accu
    }, {})
  }
  return val
}

const docTree = recurseGenerateTree(root, properties).model
let fallback: any = recurseGenerateFallback(docTree)

fallback = {
  event: fallback,
  ...fallback,
  ...fallback.state
}

const docs = {
  docTree,
  fallback
}

fs.writeFileSync(join(__dirname, '../src/SuperInput/docsTree.json'), JSON.stringify(docs))
// eslint-disable-next-line
console.log(`Generated doctree at ${__dirname + '../src/SuperInput/docsTree.json'}`)
