import { ComponentStory, ComponentMeta } from '@storybook/react'
import React from 'react'
import { defaultMessageConfig } from '../../utils'
import { Carousel } from '.'

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
    }
  ],
  config: {
    ...defaultMessageConfig,
    onSendData: async (data) => {
      alert('onSendData called with: ' + JSON.stringify(data))
    }
  }
}
