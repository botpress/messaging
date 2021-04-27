import express from 'express'

const app = express()
const port = 4000

app.get('/', (req, res) => {
  res.send('This is the messaging server!')
})

app.listen(port, () => {
  console.log(`Server is listening on ${port}`)
})
