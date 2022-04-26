import { syntaxTree, syntaxParserRunning } from '@codemirror/language'
import { hoverTooltip } from '@codemirror/tooltip'

import InspectCard from './InspectCard'

const hoverInspect = (eventState: any) => {
  return hoverTooltip(
    (view, pos, side) => {
      const { from, to, text } = view.state.doc.lineAt(pos)
      const nodeBefore = syntaxTree(view.state).topNode.resolveInner(pos, side)
      const object = nodeBefore.parent?.getChild('Expression')

      if (!eventState) {
        return null
      }
      if (
        !['VariableName', 'PropertyName'].find((el) => el === nodeBefore.name) &&
        !['MemberExpression', 'ExpressionStatement'].find((el) => el === nodeBefore.parent?.name)
      ) {
        return null
      }

      const varPath = view.state
        .sliceDoc(object?.from, object?.to)
        .replace('?', '')
        .split(/\.|\?\./)
      const varResult = varPath.reduce((accu: any, varStr: string) => (accu = accu[varStr] || {}), eventState)

      let start = pos,
        end = pos
      while (start > from && /\w/.test(text[start - from - 1])) {
        start--
      }
      while (end < to && /\w/.test(text[end - from])) {
        end++
      }
      if ((start === pos && side < 0) || (end === pos && side > 0)) {
        return null
      }

      const hoverWord = text.slice(start - from, end - from)

      let inspect: any = {}
      let title: string = ''
      if (varPath.length === 1 && varPath[0] === hoverWord) {
        inspect = varResult
        title = hoverWord
      } else {
        inspect = varResult[hoverWord]
        title = [...varPath, hoverWord].join('.')
      }

      return {
        pos: start,
        end,
        above: false,
        create(view) {
          return { dom: InspectCard({ title, inspect }) }
        }
      }
    },
    { hideOnChange: true }
  )
}
export default hoverInspect
