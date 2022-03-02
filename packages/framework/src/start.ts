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
        entry.router,
        // TODO: looks terrible
        async () => {
          await entry.setup()
        },
        async () => {
          await entry.destroy()
        },
        async () => {
          await entry.postDestroy()
        }
      )

      await launcher.launch()
    },
    (x) => {}
  )
}
