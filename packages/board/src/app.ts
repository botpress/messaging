import { BotpressWebchat } from '@botpress/webchat'
import { myFunction } from './script'

// eslint-disable-next-line no-console
console.log('This is the board ui')

void new BotpressWebchat().setup()

document.getElementById('my-div')!.innerText = 'This text was set by a script'

myFunction()
