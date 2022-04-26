import { fireEvent, render } from '@testing-library/react'
import renderer from '../../src/renderer'
import { defaultMessageConfig } from '../../src/utils'

describe('LoginPrompt', () => {
  test('renders correctly when last message', () => {
    const component = renderer.render({
      content: {
        type: 'login_prompt'
      },
      config: defaultMessageConfig
    })

    expect(component).toBeTruthy()
    const { container } = render(component)

    const usernameField = container.querySelector('#login_username')
    expect(usernameField).toBeTruthy()
    expect(usernameField).toHaveAttribute('type', 'input')

    const passwordField = container.querySelector('#login_password')
    expect(passwordField).toBeTruthy()
    expect(passwordField).toHaveAttribute('type', 'password')

    const submitButton = container.querySelector('#login_submit')
    expect(submitButton).toBeTruthy()
    expect(submitButton).toHaveAttribute('type', 'submit')
  })

  test('it calls onSendData on form submission', () => {
    const input = { username: 'FooBarPirate421', password: '12345' }

    const onSendData = jest.fn()

    const component = renderer.render({
      content: {
        type: 'login_prompt'
      },
      config: { ...defaultMessageConfig, onSendData }
    })

    expect(component).toBeTruthy()

    const { container } = render(component)
    container.onsubmit = jest.fn().mockImplementation((e) => e.preventDefault())

    const usernameField = container.querySelector('#login_username')
    const passwordField = container.querySelector('#login_password')
    const submitButton = container.querySelector('#login_submit')

    fireEvent.change(usernameField!, { target: { value: input.username } })
    fireEvent.change(passwordField!, { target: { value: input.password } })
    fireEvent.click(submitButton!)

    expect(onSendData).toHaveBeenCalledWith({
      type: 'login_prompt',
      text: 'Provided login information',
      ...input,
      sensitive: ['password']
    })
  })
})
