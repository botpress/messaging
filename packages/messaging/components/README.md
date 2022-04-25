# Botpress Messaging Components

A set of React Components to display Messaging content-types

## Usage

```typescript
import React from 'react'
import ReactDOM from 'react-dom'
import ReactMessageRenderer, { defaultMessageConfig } from '@botpress/messaging-components'

const messageContent = {
  type: 'text',
  text: 'Hello World!'
}

ReactDOM.render(
  <ReactMessageRenderer content={messageContent} config={defaultMessageConfig} />,
  document.getElementById('root')
)
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
