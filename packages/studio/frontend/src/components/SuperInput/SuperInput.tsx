import { completionKeymap, closeCompletion } from '@codemirror/autocomplete'
import { closeBrackets, closeBracketsKeymap } from '@codemirror/closebrackets'
import { cursorSubwordForward, cursorDocEnd } from '@codemirror/commands'
import { classHighlightStyle } from '@codemirror/highlight'
import { history, historyKeymap } from '@codemirror/history'
import { javascript } from '@codemirror/lang-javascript'
import { EditorState, Extension } from '@codemirror/state'
import { placeholder as placeholderExt, keymap, EditorView, ViewUpdate } from '@codemirror/view'
import React, { useEffect, useState, useRef, MutableRefObject } from 'react'

import EditorFrame from './EditorFrame'
import EvalPanel from './EvalPanel'
import { bpAutocomplete, BPLang, hoverInspect, exprDecorator } from './extensions'
import { SiTypes, SiProps } from './types'
import { isError, evalStrTempl } from './utils/tokenEval'

export default function SuperInput({
  value,
  eventState,
  onChange,
  placeholder,
  autoFocus = false,
  type = SiTypes.TEMPLATE,
  noGlobsEvalMsg = '',
  leftIcon,
  rightElement
}: SiProps) {
  const editor = useRef() as MutableRefObject<HTMLInputElement>
  const [panel, setPanel] = useState('')
  const [view, setView] = useState<EditorView>()

  useEffect(() => {
    const onUpdate = (update: ViewUpdate) => {
      const { focusChanged, docChanged, view } = update
      const value = update.state.doc.sliceString(0)

      if (!view.hasFocus) {
        setPanel('')
        closeCompletion(view)
      } else if (focusChanged || docChanged) {
        setPanel(!eventState ? noGlobsEvalMsg : evalStrTempl(value, eventState) || '')
      }

      if (docChanged) {
        if (view.state.doc.length === 1) {
          cursorSubwordForward(view)
        }

        if (onChange) {
          onChange(value)
        }
      }
    }

    let typeExt: Extension[] = []
    const keymapList = [...closeBracketsKeymap, ...historyKeymap]

    if (type === SiTypes.TEMPLATE) {
      typeExt = [BPLang(), exprDecorator(eventState)]
      keymapList.push(...completionKeymap)
    } else if (type === SiTypes.EXPRESSION || type === SiTypes.BOOL) {
      typeExt = [javascript()]
    }

    const extensions = [
      placeholderExt(placeholder || ''),
      EditorView.updateListener.of(onUpdate),
      EditorView.lineWrapping,
      classHighlightStyle,
      ...typeExt,
      hoverInspect(eventState),
      bpAutocomplete(eventState),
      history(),
      closeBrackets(),
      keymap.of(keymapList)
    ]

    const state = EditorState.create({
      doc: value,
      extensions
    })
    const newView = new EditorView({ state, parent: editor.current })
    setView(newView)

    if (autoFocus) {
      newView.focus()
      cursorDocEnd(newView)
    }

    return () => {
      view?.destroy()
    }
  }, [])

  useEffect(() => {
    if (!view) {
      return
    }

    const currentValue = view.state.doc.toString()
    if (value !== currentValue) {
      view.dispatch({
        changes: { from: 0, to: currentValue.length, insert: value || '' }
      })
    }
  }, [value, view])

  const panelValid = !isError(panel) && eventState ? true : null

  return (
    <EditorFrame leftIcon={leftIcon} rightElement={rightElement} ref={editor}>
      {panel ? <EvalPanel valid={panelValid} text={panel} /> : null}
    </EditorFrame>
  )
}
