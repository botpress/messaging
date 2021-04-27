import express from 'express'
import { Api } from './api'
import { App } from './app'

const port = process.env.PORT || '4000'
const exp = express()
exp.use(express.json())

const app = new App()
app.setup()

const api = new Api(app, exp)
api.setup()

exp.listen(port, () => {
  console.log(`Server is listening on ${port}`)
})
