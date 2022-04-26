import React, { createRef } from 'react'
import Slider, { Settings } from 'react-slick'

import { ActionButton, ActionType } from '../content-typings'
import { MessageTypeHandlerProps } from '../typings'

// Added those manually to remove the font dependencies which keeps showing 404 not found
import '../css/slick-theme.css'
import '../css/slick.css'

export class Carousel extends React.Component<MessageTypeHandlerProps<'carousel'>, ICarouselState> {
  private ref = createRef<HTMLDivElement>()

  public state = {
    adjustedWidth: 0
  }

  componentDidMount() {
    this.setState({ adjustedWidth: (this.ref.current?.offsetWidth || 0) - window.innerWidth })
  }

  renderCarousel() {
    // Breakpoints must be adjusted since the carousel is based on the page width, and not its parent component
    const adjustBreakpoint = (size: number): number => size - this.state.adjustedWidth

    const settings: Settings = {
      dots: false,
      infinite: false,
      responsive: [...Array(10)].map((_, i) => ({
        breakpoint: adjustBreakpoint(550 + i * 524),
        settings: { slidesToShow: i + 1 }
      })), // Carousel will be responsive for screens as width as ~5300px
      slidesToScroll: 1,
      autoplay: false,
      centerMode: false,
      arrows: this.props.items.length > 1
    }

    return (
      <Slider {...settings}>
        {this.props.items.map((el, idx) => (
          <Card {...el} key={idx} config={this.props.config} />
        ))}
      </Slider>
    )
  }

  render() {
    return (
      <div ref={this.ref} style={{ width: '100%' }}>
        {this.state.adjustedWidth && this.renderCarousel()}
      </div>
    )
  }
}

export const Card: React.FC<MessageTypeHandlerProps<'card'>> = ({ image, title, subtitle, actions, config }) => {
  return (
    <div className={'bpw-card-container'}>
      {image && <div className={'bpw-card-picture'} style={{ backgroundImage: `url("${image}")` }} />}
      <div>
        <div className={'bpw-card-header'}>
          <div className={'bpw-card-title'}>{title}</div>
          {subtitle && <div className={'bpw-card-subtitle'}>{subtitle}</div>}
        </div>
        {actions && (
          <div className={'bpw-card-buttons'}>
            {actions.map((btn: ActionButton<ActionType>) => {
              if (btn.action === 'Open URL') {
                const { url } = btn as ActionButton<'Open URL'>
                return (
                  <a
                    href={url}
                    key={`1-${btn.title}`}
                    target={/^javascript:/.test(url || '') ? '_self' : '_blank'}
                    className={'bpw-card-action'}
                  >
                    {btn.title || btn}
                    {/^javascript:/.test(url || '') ? null : <i className={'bpw-card-external-icon'} />}
                  </a>
                )
              } else if (btn.action === 'Say something') {
                const { text } = btn as ActionButton<'Say something'>
                return (
                  <a
                    onClick={async () => {
                      await config.onSendData({ type: 'say_something', text })
                    }}
                    key={`2-${btn.title}`}
                    className={'bpw-card-action'}
                  >
                    {btn.title || btn}
                  </a>
                )
              } else if (btn.action === 'Postback') {
                const { payload } = btn as ActionButton<'Postback'>
                return (
                  <a
                    onClick={async () => {
                      await config.onSendData({ type: 'postback', payload })
                    }}
                    key={`2-${btn.title}`}
                    className={'bpw-card-action'}
                  >
                    {btn.title || btn}
                  </a>
                )
              } else {
                return (
                  <a href={'#'} key={`3-${btn.title}`} target={'_blank'} className={'bpw-card-action'}>
                    {btn.title || btn}
                    <i className={'bpw-card-external-icon'} />
                  </a>
                )
              }
            })}
          </div>
        )}
      </div>
    </div>
  )
}

interface ICarouselState {
  adjustedWidth: number
}
