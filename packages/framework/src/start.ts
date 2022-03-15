import { Server } from 'http'
import { Entry } from './entry'
import { Launcher } from './launcher'
import { Starter } from './starter'

export const start = (tentry: { new (): Entry }) => {
  new Starter().start(
    async () => {
      const entry = new tentry()

      const launcher = new Launcher(
        entry.package,
        entry.name,
        entry.port,
        entry.router,
        // TODO: looks terrible
        async () => {
          await entry.setup()
        },
        async (server: Server) => {
          await entry.start(server)
        },
        async () => {
          await entry.monitor()
        },
        async () => {
          await entry.terminate()
        },
        async () => {
          await entry.destroy()
        }
      )

      await launcher.launch()
    },
    (x) => {}
  )
}
