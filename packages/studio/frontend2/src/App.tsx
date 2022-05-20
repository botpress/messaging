import React from 'react'
import { useRoutes } from 'react-router'

// We initialize the translation system here
import './translations'
import routes from './views'

const App = () => {
  const element = useRoutes(routes)

  return <div>{element}</div>
}

export default App
