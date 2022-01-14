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
  clientId: '625c1eef-3f6a-4693-bd87-42802b1ff9d0'
}

ReactDOM.render(<ExposedWebChat config={config as Config} fullscreen={true} />, document.getElementById('oldwebchat'))
