import { render } from '@testing-library/react'
import renderer from '../../src/renderer'
import { Message } from '../../src/typings'
import { defaultMessageConfig } from '../../src/utils'

describe('VoiceMessage', () => {
  test('It renders a simple html audio element with controls', () => {
    const playStub = jest.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(async () => {})
    const message: Message<'voice'> = {
      content: {
        type: 'voice',
        audio: 'http://example.org/sample.mp3'
      },
      config: { ...defaultMessageConfig, shouldPlay: true }
    }

    const messageEl = renderer.render(message)
    expect(messageEl).toBeTruthy()

    const { container } = render(messageEl)

    const audioEl = container.getElementsByTagName('audio')[0]
    const sourceEl = container.getElementsByTagName('source')[0]

    expect(sourceEl).toHaveAttribute('src', message.content.audio)
    expect(audioEl).toHaveAttribute('controls')
    expect(sourceEl).toHaveAttribute('type', 'audio/mpeg')
    expect(playStub).toHaveBeenCalled()
  })
})
