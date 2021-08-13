import { BotpressWebchat } from '@botpress/webchat'
import { WebchatRenderer } from '@botpress/webchat-skin'
import { BoardRenderer } from './render'

// We assume the messaging server is started in localhost
const url = 'http://localhost:3100'

const webchat = new BotpressWebchat(url)
new BoardRenderer(document.getElementById('board-debug')!, webchat)
new WebchatRenderer(document.getElementById('webchat')!, webchat)
void webchat.setup()
