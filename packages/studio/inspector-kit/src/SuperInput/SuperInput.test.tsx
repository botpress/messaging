import { render, screen } from '@testing-library/react'
import React from 'react'
import SuperInput from './SuperInput'

describe('SuperInput', () => {
  test('renders', () => {
    render(<SuperInput />)
  })

  test('renders rightElement', () => {
    render(<SuperInput rightElement={<div>right</div>} />)
    expect(screen.getByText('right')).toBeInTheDocument()
  })

  test('renders leftIcon svg', () => {
    render(<SuperInput leftIcon="airplane" />)
    expect(screen.getByTestId('left-icon')).toBeInTheDocument()
  })
})
