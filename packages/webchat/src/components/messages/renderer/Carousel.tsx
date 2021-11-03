import React from 'react'
import Slider from 'react-slick'

// Added those manually to remove the font dependencies which keeps showing 404 not found
import '../../../../../../assets/slick/slick-theme.css'
import '../../../../../../assets/slick/slick.css'
import { Renderer } from '../../../typings'

export class Carousel extends React.Component<ICarouselProps, ICarouselState> {
  private ref

  public state = {
    adjustedWidth: 0
  }

  componentDidMount() {
    this.setState({ adjustedWidth: this.ref.offsetWidth - window.innerWidth })
  }

  renderCarousel() {
    const carousel = this.props.carousel
    const elements = carousel.elements || []

    // Breakpoints must be adjusted since the carousel is based on the page width, and not its parent component
    const adjustBreakpoint = size => size - this.state.adjustedWidth

    const defaultSettings = {
      dots: false,
      infinite: false,
      responsive: [...Array(10)].map((_, i) => ({
        breakpoint: adjustBreakpoint(550 + i * 524),
        settings: { slidesToShow: i + 1 }
      })), // Carousel will be responsive for screens as width as ~5300px
      slidesToScroll: 1,
      autoplay: false,
      centerMode: false,
      arrows: elements.length > 1
    }

    const settings = Object.assign({}, defaultSettings, carousel.settings)

    return (
      <Slider {...settings}>
        {elements.map((el, idx) => (
          <Card element={el} key={idx} onSendData={this.props.onSendData} />
        ))}
      </Slider>
    )
  }

  render() {
    return (
      <div ref={el => (this.ref = el)} style={{ width: '100%', ...this.props.style }}>
        {this.state.adjustedWidth && this.renderCarousel()}
      </div>
    )
  }
}

export const Card = props => {
  const { picture, title, subtitle, buttons } = props.element as Renderer.Card

  return (
    <div className={'bpw-card-container'}>
      {picture && <div className={'bpw-card-picture'} style={{ backgroundImage: `url("${picture}")` }} />}
      <div>
        <div className={'bpw-card-header'}>
          <div className={'bpw-card-title'}>{title}</div>
          {subtitle && <div className={'bpw-card-subtitle'}>{subtitle}</div>}
        </div>
        <div className={'bpw-card-buttons'}>
          {buttons.map((btn: Renderer.CardButton) => {
            if (btn.url) {
              return (
                <a
                  href={btn.url}
                  key={`1-${btn.title}`}
                  target={/^javascript:/.test(btn.url) ? '_self' : '_blank'}
                  className={'bpw-card-action'}
                >
                  {btn.title || btn}
                  {/^javascript:/.test(btn.url) ? null : <i className={'bpw-card-external-icon'} />}
                </a>
              )
            } else if (btn.type === 'postback' || btn.payload) {
              return (
                <a
                  onClick={props.onSendData?.bind(this, { type: 'postback', payload: btn.payload })}
                  key={`2-${btn.title}`}
                  className={'bpw-card-action'}
                >
                  {btn.title || btn}
                </a>
              )
            } else if (btn.type === 'say_something' || btn.text) {
              return (
                <a
                  onClick={props.onSendData?.bind(this, { type: 'say_something', text: btn.text })}
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

interface ICarouselProps {
  carousel: Renderer.Carousel
  onSendData: any
  style?: object
}

interface ICarouselState {
  adjustedWidth: number
}
