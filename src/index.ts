import express from 'express'
import { Api } from './api'
import { App } from './app'

const port = process.env.PORT || '3000'
const exp = express()
exp.use(express.json())
exp.use(express.urlencoded({ extended: true }))

const setup = async () => {
  const app = new App(exp)
  await app.setup()

  const api = new Api(app, exp)
  await api.setup()
}

setup()

exp.listen(port, () => {
  console.log(`Server is listening on ${port}`)
})
