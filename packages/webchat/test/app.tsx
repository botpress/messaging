import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { ExposedWebChat, Config } from '../src/index'

export const Webchat: React.FC = () => {
  const [config, setConfig] = useState<Config>({
    messagingUrl: 'http://localhost:3100',
    clientId: ''
  })

  const search = window.location.search

  useEffect(() => {
    const config = new URLSearchParams(search).get('config')

    if (!config) {
      return
    }

    setConfig(JSON.parse(config))
  }, [search])

  if (!config.clientId) {
    return null
  }

  return (
    <div>
      <ExposedWebChat config={config} fullscreen={true} />
    </div>
  )
}

ReactDOM.render(<Webchat />, document.getElementById('webchat'))
