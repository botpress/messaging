import { EditorView, Decoration, DecorationSet, ViewPlugin, ViewUpdate } from '@codemirror/view'

import jsRange from '../utils/jsRange'
import { isError, rmDelim, verifyJs, evalToken } from '../utils/tokenEval'

const validHighlight = Decoration.mark({ class: 'cm-block valid' })
const invalidHighlight = Decoration.mark({ class: 'cm-block invalid' })

const exprDecorator = (eventState: any) => {
  const highlight = (view: EditorView): DecorationSet => {
    const docStr = view.state.doc.sliceString(0)
    const matches = jsRange(docStr)
    if (!matches) {
      return Decoration.set([])
    }

    let pos = 0
    const decos = matches.map((match) => {
      const from = docStr.indexOf(match, pos)
      const to = from + match.length
      pos = to

      if (eventState) {
        const res = evalToken(rmDelim(match), eventState)
        if (res && !isError(res)) {
          return validHighlight.range(from, to)
        } else {
          return invalidHighlight.range(from, to)
        }
      } else {
        if (verifyJs(rmDelim(match))) {
          return validHighlight.range(from, to)
        } else {
          return invalidHighlight.range(from, to)
        }
      }
    })

    return Decoration.set(decos)
  }

  const exprDecoratorsPlugin = ViewPlugin.fromClass(
    class {
      decorations: DecorationSet

      constructor(readonly view: EditorView) {
        this.decorations = highlight(view)
      }

      update(update: ViewUpdate) {
        const { docChanged, view } = update
        if (docChanged) {
          this.decorations = highlight(view)
        }
      }
    },
    {
      decorations: (v) => v.decorations
    }
  )
  return [exprDecoratorsPlugin]
}

export default exprDecorator
