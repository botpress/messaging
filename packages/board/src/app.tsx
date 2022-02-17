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
  clientId: 'bd5f6d95-b8a0-45e4-baf0-631e269a78ea'
}

ReactDOM.render(<ExposedWebChat config={config as Config} fullscreen={true} />, document.getElementById('oldwebchat'))
