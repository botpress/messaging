import { BotConfig } from '@botpress/sdk'
import { StudioServices } from '../studio-router'
import { Instance } from '../utils/bpfs'
import { CustomStudioRouter } from '../utils/custom-studio-router'

export class ConfigRouter extends CustomStudioRouter {
  constructor(services: StudioServices) {
    super('Config', services.logger)
  }

  setupRoutes() {
    const router = this.router
    router.get(
      '/',
      this.needPermissions('read', 'bot.information'),
      this.asyncMiddleware(async (req, res) => {
        const botConfig: BotConfig = await Instance.readFile('bot.config.json').then((buf) =>
          JSON.parse(buf.toString())
        )
        res.send(botConfig)
      })
    )

    router.post(
      '/',
      this.needPermissions('write', 'bot.information'),
      this.asyncMiddleware(async (req, res) => {
        const { botId } = req.params
        const botConfig = <BotConfig>req.body
        await Instance.upsertFile('bot.config.json', JSON.stringify(botConfig))
        res.send({ botId })
      })
    )
  }
}
