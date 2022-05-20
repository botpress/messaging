import React from 'react'
import { RouteObject } from 'react-router'

import Home from './Home'
import { Stats } from './Stats'

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/stats',
    element: <Stats />
  }
]

export default routes
