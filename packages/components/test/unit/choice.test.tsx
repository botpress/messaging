import { fireEvent, render } from '@testing-library/react'
import React from 'react'
import { Button } from '../../src/base/button'

describe('Single Choice Button element', () => {
  test('it renders a simple button correctly', () => {
    const label = 'Hello'
    const onFileUpload = jest.fn()

    const { container } = render(<Button label={label} payload={'test'} onFileUpload={onFileUpload} />)
    const button = container.querySelector('button')

    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent(label)
  })

  test('it disables button after click when preventDoubleClick is true', () => {
    const label = 'Hello'
    const onFileUpload = jest.fn()

    const { container } = render(
      <Button label={label} payload={'test'} onFileUpload={onFileUpload} preventDoubleClick={true} />
    )
    const button = container.querySelector('button')

    expect(button).toBeInTheDocument()
    fireEvent.click(button!)
    expect(button).toHaveAttribute('disabled')
  })

  test('it does not disable button after click when preventDoubleClick is false', () => {
    const label = 'Hello'
    const onFileUpload = jest.fn()

    const { container } = render(
      <Button label={label} payload={'test'} onFileUpload={onFileUpload} preventDoubleClick={false} />
    )
    const button = container.querySelector('button')

    expect(button).toBeInTheDocument()
    fireEvent.click(button!)
    expect(button).not.toHaveAttribute('disabled')
  })

  test('it calls onFileUpload with uploaded file with payload BOTPRESS.FILE_UPLOAD ', () => {
    const label = 'Hello'
    const onFileUpload = jest.fn()
    const testFile = new File(['test'], 'test.txt', { type: 'text/plain' })

    const { container } = render(<Button label={label} payload={'BOTPRESS.FILE_UPLOAD'} onFileUpload={onFileUpload} />)
    const button = container.querySelector('button')
    const fileInput = container.querySelector('input[type="file"]')

    expect(button).toBeInTheDocument()
    expect(fileInput).toBeInTheDocument()
    expect(fileInput).toHaveAttribute('accept', '*/*')

    fireEvent.click(button!)

    fireEvent.change(fileInput!, { target: { files: [testFile] } })

    expect(onFileUpload).toHaveBeenCalledWith(label, 'BOTPRESS.FILE_UPLOAD', testFile)
  })

  test('it calls onFileUpload with uploaded image with payload BOTPRESS.Image_UPLOAD ', () => {
    const label = 'Hello'
    const onFileUpload = jest.fn()
    const testFile = new File(['test'], 'test.png', { type: 'image/png' })

    const { container } = render(<Button label={label} payload={'BOTPRESS.IMAGE_UPLOAD'} onFileUpload={onFileUpload} />)
    const button = container.querySelector('button')
    const fileInput = container.querySelector('input[type="file"]')

    expect(button).toBeInTheDocument()
    expect(fileInput).toBeInTheDocument()
    expect(fileInput).toHaveAttribute('accept', 'image/*')

    fireEvent.click(button!)

    fireEvent.change(fileInput!, { target: { files: [testFile] } })

    expect(onFileUpload).toHaveBeenCalledWith(label, 'BOTPRESS.IMAGE_UPLOAD', testFile)
  })
})
