import React from 'react'
import * as style from './EvalPanel.module.scss'
import { PanelProps } from './types'

const EvalPanel = ({ valid, text }: PanelProps) => {
  return (
    <div className={`${style.bpEvalPanel} ${valid === null ? 'no-eventState' : valid ? 'valid' : 'invalid'}`}>
      {text}
    </div>
  )
}

export default EvalPanel
