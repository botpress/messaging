import React from 'react'
import styles from './EvalPanel.module.scss'
import { PanelProps } from './types'

const EvalPanel = ({ valid, text }: PanelProps) => {
  return (
    <div className={`${styles.bpEvalPanel} ${valid === null ? 'no-eventState' : valid ? 'valid' : 'invalid'}`}>
      {text}
    </div>
  )
}

export default EvalPanel
