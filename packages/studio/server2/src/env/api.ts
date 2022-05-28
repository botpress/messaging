import { PublicApiManager } from '@botpress/framework'
import { Request, Response } from 'express'
import { Schema } from './schema'

export class EnvApi {
  setup(router: PublicApiManager) {
    router.get('/env', Schema.Api.Get, this.get.bind(this))
  }

  async get(req: Request, res: Response) {
    const { botId } = req.params

    const commonEnv = {
      SEND_USAGE_STATS: true,
      USE_JWT_COOKIES: false,
      SHOW_POWERED_BY: true,
      // UUID: await machineUUID(),
      BP_SERVER_URL: process.env.BP_SERVER_URL || '',
      IS_STANDALONE: true
    }

    // const segmentWriteKey = process.core_env.BP_DEBUG_SEGMENT
    //   ? 'OzjoqVagiw3p3o1uocuw6kd2YYjm6CHi' // Dev key from Segment
    //  : '7lxeXxbGysS04TvDNDOROQsFlrls9NoY' // Prod key from Segment

    const host = process.env.EXTERNAL_URL || 'http://localhost:3300'
    const env = {
      ...commonEnv,
      // STUDIO_VERSION: process.STUDIO_VERSION,
      // ANALYTICS_ID: gaId,
      API_PATH: `${host}/api/v1`,
      BOT_API_PATH: `${host}/api/v1`,
      STUDIO_API_PATH: `${host}/api/v1`,
      BOT_ID: botId,
      BP_BASE_PATH: '',
      APP_NAME: 'Botpress Studio',
      APP_FAVICON: 'assets/ui-studio/public/img/favicon.png',
      APP_CUSTOM_CSS: '',
      BOT_LOCKED: false,
      IS_BOT_MOUNTED: true,
      IS_CLOUD_BOT: true,
      // SEGMENT_WRITE_KEY: segmentWriteKey,
      // NLU_ENDPOINT: process.NLU_ENDPOINT,
      BP_SOCKET_URL: host
    }

    res.send(env)
  }
}
