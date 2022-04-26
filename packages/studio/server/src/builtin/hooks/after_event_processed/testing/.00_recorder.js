const axios = require('axios')

async function execute() {
  try {
    const axiosConfig = await bp.http.getAxiosConfigForBot(event.botId, { studioUrl: true })
    await axios.post('/testing/processedEvent', event, axiosConfig)
  } catch (err) {
    console.log('Error processing', err.message)
  }
}

return execute()
