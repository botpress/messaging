import 'regenerator-runtime/runtime'
import { ExposedWebChat, Config } from '@botpress/webchat'
import React from 'react'
import ReactDOM from 'react-dom'

// Uncomment this for the test webchat
/*
import { BoardLinker } from './linker'

new BoardLinker(
  document.getElementById('board-linker')!,
  document.getElementById('webchat')!,
  document.getElementById('board-watcher')!
)
*/

const config: Partial<Config> = {
  url: 'http://localhost:3100',
  clientId: '8b6b25ae-e47d-455e-8057-356dae07fff2'
}

ReactDOM.render(<ExposedWebChat config={config as Config} fullscreen={true} />, document.getElementById('oldwebchat'))
