import { ContainerModule, interfaces } from 'inversify'
import { TYPES } from '../../types'

import { ActionsStats } from './actions-stats'
import { ConfigsStats } from './configs-stats'
import { HooksStats } from './hooks-stats'
import { SDKStats } from './sdk-stats'
import { UserStats } from './user-stats'

const ServicesContainerModule = new ContainerModule((bind: interfaces.Bind) => {
  bind<ActionsStats>(TYPES.ActionStats)
    .to(ActionsStats)
    .inSingletonScope()

  bind<SDKStats>(TYPES.SDKStats)
    .to(SDKStats)
    .inSingletonScope()

  bind<HooksStats>(TYPES.HooksStats)
    .to(HooksStats)
    .inSingletonScope()

  bind<ConfigsStats>(TYPES.ConfigsStats)
    .to(ConfigsStats)
    .inSingletonScope()

  bind<UserStats>(TYPES.UserStats)
    .to(UserStats)
    .inSingletonScope()
})

export const TelemetryContainerModules = [ServicesContainerModule]
