import { fireEvent, render } from '@testing-library/react'
import { ActionButton } from '../../src/content-typings'
import renderer from '../../src/renderer'
import { Message } from '../../src/typings'
import { defaultMessageConfig } from '../../src/utils'

describe('Carousel & Card renderer', () => {
  const messageData: Message<'carousel'> = {
    content: {
      type: 'carousel',
      items: [
        {
          title: 'Card 1',
          subtitle: 'Subtitle 1',
          image: 'https://via.placeholder.com/150/150',
          actions: [
            {
              title: 'Button 1',
              action: 'Postback',
              payload: 'button_clicked'
            }
          ]
        }
      ]
    },
    config: defaultMessageConfig
  }

  test('it renders a single card with image, title, subtitle and button', () => {
    const card = messageData.content.items[0]
    const component = renderer.render(messageData)

    expect(component).toBeTruthy()

    const { container } = render(component)

    expect(container.querySelector('.slick-slider')).toBeInTheDocument()
    expect(container.querySelector('.bpw-card-picture')).toHaveStyle(`background-image: url(${card.image})`)
    expect(container.querySelector('.bpw-card-title')).toHaveTextContent(card.title)
    expect(container.querySelector('.bpw-card-subtitle')).toHaveTextContent(card.subtitle!)

    const btnEl = container.querySelector('.bpw-card-action')
    expect(btnEl).toHaveTextContent(card.actions![0].title)
  })

  test('it renders a card with image, title, subtitle and no button', () => {
    const noBtnMessageData: Message<'carousel'> = {
      content: {
        type: 'carousel',
        items: [
          {
            title: 'Card 1',
            subtitle: 'Subtitle 1',
            image: 'https://via.placeholder.com/150/150'
          }
        ]
      },
      config: defaultMessageConfig
    }

    const card = noBtnMessageData.content.items[0]
    const component = renderer.render(noBtnMessageData)

    expect(component).toBeTruthy()

    const { container } = render(component)

    expect(container.querySelector('.slick-slider')).toBeInTheDocument()
    expect(container.querySelector('.bpw-card-picture')).toHaveStyle(`background-image: url(${card.image})`)
    expect(container.querySelector('.bpw-card-title')).toHaveTextContent(card.title)
    expect(container.querySelector('.bpw-card-subtitle')).toHaveTextContent(card.subtitle!)

    expect(container.querySelector('.bpw-card-action')).not.toBeInTheDocument()
  })

  test('it calls onSendData with postback payload on postback button click', () => {
    const mockOnSendData = jest.fn()
    const component = renderer.render({
      ...messageData,
      config: { ...defaultMessageConfig, onSendData: mockOnSendData }
    })

    const { container } = render(component)

    const btnEl = container.querySelector('.bpw-card-action')

    fireEvent.click(btnEl!)

    const card = messageData.content.items[0]
    expect(mockOnSendData).toHaveBeenCalledWith({
      payload: (card.actions![0] as ActionButton<'Postback'>).payload,
      type: 'postback'
    })
  })

  test('it shows a link button for URL buttons', () => {
    const urlBtnMessageData: Message<'carousel'> = {
      content: {
        type: 'carousel',
        items: [
          {
            title: 'Card 1',
            subtitle: 'Subtitle 1',
            image: 'https://via.placeholder.com/150/150',
            actions: [
              {
                action: 'Open URL',
                title: 'Button 1',
                url: 'https://botpress.com'
              }
            ]
          }
        ]
      },
      config: defaultMessageConfig
    }
    const component = renderer.render(urlBtnMessageData)

    const { container } = render(component)

    const btnEl = container.querySelector('.bpw-card-action')

    expect(btnEl).toHaveAttribute(
      'href',
      (urlBtnMessageData.content.items[0].actions![0] as ActionButton<'Open URL'>).url
    )
    expect(btnEl).toHaveAttribute('target', '_blank')
  })
})
