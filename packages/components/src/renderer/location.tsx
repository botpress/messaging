import { Status, Wrapper } from '@googlemaps/react-wrapper'
import React, { useEffect, useRef } from 'react'
import { MessageTypeHandlerProps } from '../typings'

export const MapContainer: React.FC<MessageTypeHandlerProps<'location'>> = ({ latitude, longitude, address }) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) {
      return
    }

    const position = { lat: latitude, lng: longitude }

    const map = new window.google.maps.Map(ref.current, {
      center: position,
      zoom: 14
    })

    const marker = new google.maps.Marker({
      position,
      map,
      title: address
    })

    return () => {
      marker.setMap(null)
    }
  })

  return <div ref={ref} id="map" />
}

const Fallback = ({ latitude, longitude }: { latitude: number; longitude: number }): React.ReactElement => {
  const link = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
  return (
    <p>
      Location:&nbsp;
      <a href={link} target="_blank">
        {link}
      </a>
    </p>
  )
}

const render =
  (latitude: number, longitude: number) =>
  (status: Status): React.ReactElement => {
    if (status === Status.LOADING) {
      return <div>Loading...</div>
    } else if (status === Status.FAILURE) {
      return <Fallback latitude={latitude} longitude={longitude} />
    } else {
      return <></>
    }
  }

export const Location: React.FC<MessageTypeHandlerProps<'location'>> = ({
  latitude,
  longitude,
  address,
  title,
  type,
  config
}) => {
  if (config.googleMapsAPIKey) {
    return (
      <Wrapper apiKey={config.googleMapsAPIKey} render={render(latitude, longitude)}>
        <MapContainer
          latitude={latitude}
          longitude={longitude}
          address={address}
          title={title}
          type={type}
          config={config}
        />
      </Wrapper>
    )
  } else {
    return <Fallback latitude={latitude} longitude={longitude} />
  }
}
