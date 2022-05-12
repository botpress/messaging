import React from 'react'
import { RouteObject } from 'react-router'

import Home from './Home'

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Home />
  }
]

export default routes
