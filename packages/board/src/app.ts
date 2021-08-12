import { BotpressWebchat, WebchatRenderer } from '@botpress/webchat'

// We assume the messaging server is started in localhost
const url = 'http://localhost:3100'
const root = document.getElementById('my-div')!

const webchat = new BotpressWebchat(url)
const renderer = new WebchatRenderer(root, webchat)
void webchat.setup()
