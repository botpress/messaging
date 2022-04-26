const axios = require('axios')
const _ = require('lodash')

async function processIncoming() {
  try {
    const axiosConfig = await bp.http.getAxiosConfigForBot(event.botId, { studioUrl: true })
    const { data } = await axios.post('/testing/incomingEvent', event, axiosConfig)

    if (data) {
      event.state = _.merge(event.state, data)
    }
  } catch (err) {
    console.log('Error processing', err.message)
  }
}

return processIncoming()
