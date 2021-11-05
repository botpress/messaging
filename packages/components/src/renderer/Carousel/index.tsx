import React, { createRef } from 'react'
import Slider, { Settings } from 'react-slick'

// Added those manually to remove the font dependencies which keeps showing 404 not found
import './css/slick-theme.css'
import './css/slick.css'
import { MessageTypeHandlerProps } from '../../typings'
import { isSaySomething } from '@botpress/messaging-server/content-types'

export class Carousel extends React.Component<MessageTypeHandlerProps<'carousel'>, ICarouselState> {
  private ref = createRef<HTMLDivElement>()

  public state = {
    adjustedWidth: 0
  }

  componentDidMount() {
    this.setState({ adjustedWidth: this.ref.current?.offsetWidth || 0 - window.innerWidth })
  }

  renderCarousel() {
    // Breakpoints must be adjusted since the carousel is based on the page width, and not its parent component
    const adjustBreakpoint = (size: number): number => size - this.state.adjustedWidth

    const defaultSettings: Settings = {
      dots: false,
      infinite: false,
      responsive: [...Array(10)].map((_, i) => ({
        breakpoint: adjustBreakpoint(550 + i * 524),
        settings: { slidesToShow: i + 1 }
      })),
      slidesToScroll: 1,
      autoplay: false,
      centerMode: false,
      arrows: this.props.items.length > 1
    }

    const settings = defaultSettings

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
        <div className={'bpw-card-buttons'}>
          {actions.map((btn) => {
            if (btn.action === 'Open URL') {
              return (
                <a
                  href={btn.url}
                  key={`1-${btn.title}`}
                  target={/^javascript:/.test(btn.url || '') ? '_self' : '_blank'}
                  className={'bpw-card-action'}
                >
                  {btn.title || btn}
                  {/^javascript:/.test(btn.url || '') ? null : <i className={'bpw-card-external-icon'} />}
                </a>
              )
            } else if (isSaySomething(btn)) {
              return (
                <a
                  onClick={async () => {
                    await config.onSendData({ type: 'say_something', text: btn.text })
                  }}
                  key={`2-${btn.title}`}
                  className={'bpw-card-action'}
                >
                  {btn.title || btn}
                </a>
              )
            } else if (btn.type === 'postback') {
              return (
                <a
                  onClick={async () => {
                    await config.onSendData({ type: 'postback', payload: btn.payload })
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
      </div>
    </div>
  )
}

interface ICarouselState {
  adjustedWidth: number
}
