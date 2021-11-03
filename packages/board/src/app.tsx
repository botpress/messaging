import 'regenerator-runtime/runtime'
import { ExposedWebChat } from '@botpress/webchat'
import React from 'react'
import ReactDOM from 'react-dom'
import { BoardLinker } from './linker'

ReactDOM.render(<ExposedWebChat />, document.getElementById('oldwebchat'))

new BoardLinker(
  document.getElementById('board-linker')!,
  document.getElementById('webchat')!,
  document.getElementById('board-watcher')!
)
