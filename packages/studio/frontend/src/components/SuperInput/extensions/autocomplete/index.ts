import { autocompletion, Completion, CompletionContext } from '@codemirror/autocomplete'
import { cursorSubwordForward } from '@codemirror/commands'
import { syntaxTree } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
import TreeModel from 'tree-model'

import { AC_BOOST_KEYS, UNKNOWN_TYPE } from '../../config'
import { fallback, docTree } from '../../docsTree.json'
import InfoCard from './InfoCard'
import { DocNode } from './types'

const COMPLETE_AFTER = ['PropertyName', '.', '?.', '[']
const DONT_COMPLETE_IN = [
  'String',
  'TemplateString',
  'LineComment',
  'BlockComment',
  'VariableDefinition',
  'PropertyDefinition'
]

const tree = new TreeModel()

const fullDocTree: DocNode = tree.parse(docTree as any)

const makeCompletionFrom = (from: number, eventState: any = {}, docTree: DocNode, apply?: (key: string) => {}) => {
  if (typeof eventState !== 'object' && typeof eventState !== 'function') {
    return null
  }

  return {
    from,
    span: /^\w{2,}$/,
    options: Object.keys(eventState).reduce((accu: any, key: string) => {
      const docNode = docTree.first({ strategy: 'breadth' }, (node: DocNode) => {
        return node.model.key === key
      })
      const type = docNode?.model.type || typeof eventState[key] || UNKNOWN_TYPE
      accu.push({
        label: key,
        boost: AC_BOOST_KEYS[key] || 0,
        detail: type,
        info: InfoCard({
          key,
          type,
          link: docNode?.model.link || null,
          docs: docNode?.model.docs || null,
          evals: eventState[key]
        }),
        apply: apply ? apply(key) : key
      })
      return accu
    }, [])
  }
}

const eventStateCompletions = (eventState: any) => {
  if (!eventState) {
    eventState = fallback
  }

  return (ctx: CompletionContext) => {
    const nodeBefore = syntaxTree(ctx.state).resolveInner(ctx.pos, -1)

    // any input around whitespace is considered in script OR
    // if brackets are just opened and no whitespace this means its empty
    if (COMPLETE_AFTER.includes(nodeBefore.name) && nodeBefore.parent?.name === 'MemberExpression') {
      const object = nodeBefore.parent.getChild('Expression')
      const varPath = ctx.state
        .sliceDoc(object?.from, object?.to)
        .replace('?', '')
        .replace('[', '.')
        .replace(']', '')
        .split(/\.|\?\./)

      const from = /[.[]/.test(nodeBefore.name) ? nodeBefore.to : nodeBefore.from
      const varResult = varPath.reduce((accu: any, varStr: string) => (accu = accu[varStr] || {}), eventState)
      const cutDocTree = varPath.reduce((accu: any, el: any) => {
        return (
          accu.first({ strategy: 'breadth' }, (node: DocNode) => {
            if (node.model.key === el || node.model.key === '*') {
              return true
            }
          }) || accu
        )
      }, fullDocTree)

      return makeCompletionFrom(from, varResult, cutDocTree)
    } else if (nodeBefore.name === 'VariableName' || nodeBefore.name === 'Script') {
      return makeCompletionFrom(nodeBefore.from, eventState, fullDocTree)
    } else if (nodeBefore.name === '{' && nodeBefore.parent?.name === 'Block') {
      return makeCompletionFrom(ctx.pos, eventState, fullDocTree, (key) => {
        return (view: EditorView, completion: Completion, from: number) => {
          const applyStr = ` ${key} `
          view.dispatch({
            changes: { from, insert: applyStr }
          })
          cursorSubwordForward(view)
        }
      })
    } else if (ctx.explicit && !DONT_COMPLETE_IN.includes(nodeBefore.name)) {
      return makeCompletionFrom(ctx.pos, eventState, fullDocTree, (key) => {
        return (view: EditorView, completion: Completion, from: number) => {
          const applyStr = `{{ ${key} }}`
          view.dispatch({
            changes: { from, insert: applyStr }
          })
          cursorSubwordForward(view)
          cursorSubwordForward(view)
        }
      })
    }
    return null
  }
}

const bpAutocomplete = (eventState: any) => {
  return autocompletion({
    override: [eventStateCompletions(eventState)],
    icons: false
    // optionClass: (completion: Completion) => {
    //   let className = 'cm-options '
    //   if (Object.keys(BOOST_KEYS).includes(completion.label)) className += 'cm-options-common '
    //   if (completion.detail === 'function') className += 'cm-option-func '
    //   return className
    // }
  })
}

export default bpAutocomplete
