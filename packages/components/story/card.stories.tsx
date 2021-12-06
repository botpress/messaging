import { ComponentStory, ComponentMeta } from '@storybook/react'
import React from 'react'
import { Card } from '../src/renderer/carousel'
import { defaultMessageConfig } from '../src/utils'

export default {
  title: 'Card',
  component: Card
} as ComponentMeta<typeof Card>

const Template: ComponentStory<typeof Card> = (args) => <Card {...args} />

export const Primary = Template.bind({})

Primary.args = {
  title: 'Card 1',
  subtitle: 'Subtitle 1',
  image: 'https://via.placeholder.com/150/150',
  actions: [
    {
      title: 'Button 1',
      action: 'Postback',
      payload: 'button_clicked'
    }
  ],
  config: {
    ...defaultMessageConfig,
    onSendData: async (data) => {
      alert('onSendData called with: ' + JSON.stringify(data))
    }
  }
}
