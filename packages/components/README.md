# Botpress Message React Renderer

## Usage

```typescript
import React from 'react'
import ReactDOM from 'react-dom'
import renderer, { defaultMessageConfig, Message } from '@botpress/messaging-components'

const messageData: Message<'carousel'> = {
  type: 'carousel',
  payload: {
    carousel: {
      elements: [
        {
          title: 'Card 1',
          subtitle: 'Subtitle 1',
          picture: 'https://via.placeholder.com/150/150',
          buttons: [
            {
              title: 'Button 1',
              type: 'postback',
              payload: { data: 'button_clicked' }
            }
          ]
        }
      ]
    }
  },
  config: defaultMessageConfig
}

const Message = renderer.render(messageData)
ReactDOM.render(<Message />, document.getElementById('root'))

// To override a message type renderer with your own

const MyCarousel: MessageTypeHandler<'carousel'> = ({ payload, config }) => {
  return <div>My Carousel is showing {payload.carousel.elements.length} items</div>
}

renderer.set('carousel', MyCarousel)
```

## Development

Build:

```sh
$ yarn build
```

Run Tests:

```sh
$ yarn test
```

View and play with components in Storybook:

```sh
$ yarn storybook
```
