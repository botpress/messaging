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
  messagingUrl: 'http://localhost:3100',
  clientId: '546507be-44e2-4675-8e18-ce7f17e8513d'
}

ReactDOM.render(<ExposedWebChat config={config as Config} fullscreen={true} />, document.getElementById('oldwebchat'))
