import { ComponentStory, ComponentMeta } from '@storybook/react'
import React from 'react'
import { Carousel } from '../src/renderer/carousel'
import { defaultMessageConfig } from '../src/utils'

export default {
  title: 'Carousel',
  component: Carousel
} as ComponentMeta<typeof Carousel>

const Template: ComponentStory<typeof Carousel> = (args) => <Carousel {...args} />

export const Primary = Template.bind({})

Primary.args = {
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
    },
    {
      title: 'Card 2',
      subtitle: 'Subtitle 2',
      image: 'https://via.placeholder.com/150/150'
    }
  ],
  config: {
    ...defaultMessageConfig,
    onSendData: async (data) => {
      alert('onSendData called with: ' + JSON.stringify(data))
    }
  }
}
