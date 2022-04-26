import { render } from '@testing-library/react'
import renderer from '../../src/renderer'
import { defaultMessageConfig } from '../../src/utils'

describe('File renderer', () => {
  test('it renders a file of unsupported mime type as a download link', () => {
    const file = 'http://example.org/file.txt'
    const component = renderer.render({
      content: { type: 'file', file, title: 'file.txt' },
      config: defaultMessageConfig
    })

    expect(component).toBeTruthy()

    const { container } = render(component)
    const linkElement = container.querySelector('a')
    expect(linkElement).toBeTruthy()
    expect(linkElement?.href).toBe(file)
    expect(linkElement?.textContent).toBe('file.txt')
    expect(linkElement?.target).toBe('_blank')
    expect(linkElement?.rel).toBe('noopener noreferrer')
  })

  test('it renders a video file as video player with controls', () => {
    const video = 'http://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_1080p_30fps_normal.mp4'
    const component = renderer.render({
      content: { type: 'video', video },
      config: defaultMessageConfig
    })

    expect(component).toBeTruthy()
    const { container } = render(component)

    const el = container.querySelector('video')
    const src = container.querySelector('video source')
    expect(el).toBeInTheDocument()
    expect(el?.hasAttribute('controls')).toBe(true)

    expect(src).toBeInTheDocument()
    expect(src?.getAttribute('src')).toBe(video)
    expect(src?.getAttribute('type')).toBe('video/mp4')
  })

  test('it renders an image file', () => {
    const url = 'https://upload.wikimedia.org/wikipedia/commons/9/90/Touched_by_His_Noodly_Appendage_HD.jpg'
    const component = renderer.render({
      content: {
        type: 'image',
        image: url
      },
      config: defaultMessageConfig
    })

    expect(component).toBeTruthy()
    const { container } = render(component)

    const el = container.querySelector('img')

    expect(el).toBeInTheDocument()
    expect(el?.getAttribute('src')).toBe(url)
  })

  test('it renders an audio player', () => {
    const url = 'https://www2.cs.uic.edu/~i101/SoundFiles/StarWars60.wav'
    const component = renderer.render({
      content: { type: 'audio', title: 'Hello Audio', audio: url },
      config: defaultMessageConfig
    })

    expect(component).toBeTruthy()
    const { container } = render(component)

    const el = container.querySelector('audio')
    const src = container.querySelector('audio source')
    expect(el).toBeInTheDocument()
    expect(el?.hasAttribute('controls')).toBe(true)

    expect(src).toBeInTheDocument()
    expect(src?.getAttribute('src')).toBe(url)
    expect(src?.getAttribute('type')).toBe('audio/wav')
  })
})
