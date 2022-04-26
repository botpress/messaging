import { Button } from '@blueprintjs/core'
import { ComponentMeta } from '@storybook/react'
import React from 'react'
import { Input } from '.'

export default {
  title: 'Input',
  component: Input
} as ComponentMeta<typeof Input>

export const Primary = () => (
  <div>
    <Input defaultValue="Howdy Partner" />
    <a href="https://blueprintjs.com/docs/#core/components/text-inputs.props" target="_blank">
      Open Blueprint Documentation
    </a>
  </div>
)
Primary.story = {
  name: 'Uncontrolled'
}

export const Controlled = () => {
  const [value, setValue] = React.useState('')
  return (
    <div>
      <Input placeholder="Enter your name" value={value} onChange={(e) => setValue(e.target.value)} />
      {value && <span>Hello {value} 👋</span>}
    </div>
  )
}
Controlled.story = {
  name: 'Controlled'
}

export const LeftIcon = () => <Input defaultValue="I have an icon" leftIcon="user" />
LeftIcon.story = {
  name: 'Left Icon'
}

export const RightElement = () => (
  <Input defaultValue="I have a right element" rightElement={<Button>A Button</Button>} />
)
RightElement.story = {
  name: 'Right Element'
}

export const LeftElement = () => (
  <Input
    placeholder="Everybody clap your hands"
    leftElement={<Button>Slide to the left</Button>}
    rightElement={<Button>Slide to the right</Button>}
  />
)
