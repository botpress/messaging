import { BotpressWebchat, element, text, WebchatRenderer } from '@botpress/webchat'
import { BoardRenderer } from './render'

// We assume the messaging server is started in localhost
const url = 'http://localhost:3100'

const webchat = new BotpressWebchat(url)
const boardRenderer = new BoardRenderer(document.getElementById('board-debug')!, webchat)
const webchatRenderer = new WebchatRenderer(document.getElementById('webchat')!, webchat)

void webchat.setup()
