import { postMessageToParent } from '../../webchat/src/utils/webchatEvents'
import { isWebchatEvent } from './inject'

describe('Test inject', () => {
  it('post correct messages', () => {
    window.parent.postMessage = jest.fn()

    postMessageToParent('LIFECYCLE.LOADED', undefined, 'bp-chat')

    const message = { data: { type: 'LIFECYCLE.LOADED', value: undefined, chatId: 'bp-chat' } }

    expect(window.parent.postMessage).toHaveBeenCalledTimes(1)
    expect(window.parent.postMessage).toHaveBeenCalledWith(message.data, '*')

    expect(isWebchatEvent(message.data)).toBeTruthy()
  })
})
