import express from 'express'
import { createServer } from 'http'

const port = process.env.PORT || '4000'
const app = express()
const http = createServer(app)
app.use(express.json())

app.get('/', (req, res) => {
  const prop = req.body.prop
  res.send(`This is the messaging server! ${prop}`)
})

http.listen(port, () => {
  console.log(`Server is listening on ${port}`)
})
