import { lang } from '../translations'

import { QuickShortcut } from './typings'

export const getCommonShortcuts = () => {
  const adminShortcuts: QuickShortcut[] = [
    {
      label: `${lang.tr('sideMenu.workspace')} - ${lang.tr('sideMenu.bots')}`,
      type: 'goto',
      url: '/workspace/:workspaceId?/bots',
      permission: { resource: 'user.bots.*', operation: 'read' }
    },
    {
      label: `${lang.tr('sideMenu.workspace')} - ${lang.tr('sideMenu.collaborators')}`,
      type: 'goto',
      url: '/workspace/:workspaceId?/users',
      permission: { resource: 'admin.collaborators.*', operation: 'read' }
    },
    {
      label: `${lang.tr('sideMenu.workspace')} - ${lang.tr('sideMenu.roles')}`,
      type: 'goto',
      url: '/workspace/:workspaceId?/roles',
      permission: { resource: 'user.roles.*', operation: 'read' }
    },
    {
      label: `${lang.tr('sideMenu.workspace')} - ${lang.tr('sideMenu.logs')}`,
      type: 'goto',
      url: '/workspace/:workspaceId?/logs',
      permission: { resource: 'user.logs', operation: 'read' }
    },
    {
      label: `${lang.tr('sideMenu.management')} - ${lang.tr('sideMenu.sourceControl')}`,
      type: 'goto',
      url: '/server/version',
      permission: { superAdmin: true }
    },
    {
      label: `${lang.tr('sideMenu.management')} - ${lang.tr('sideMenu.serverLicense')}`,
      type: 'goto',
      url: '/server/license',
      permission: { superAdmin: true }
    },
    {
      label: `${lang.tr('sideMenu.management')} - ${lang.tr('sideMenu.languages')}`,
      type: 'goto',
      url: '/server/languages',
      permission: { superAdmin: true }
    },
    {
      label: `${lang.tr('sideMenu.management')} - ${lang.tr('sideMenu.modules')}`,
      type: 'goto',
      url: '/modules',
      permission: { superAdmin: true }
    },
    {
      label: `${lang.tr('sideMenu.management')} - ${lang.tr('sideMenu.productionChecklist')}`,
      type: 'goto',
      url: '/checklist',
      permission: { superAdmin: true }
    },
    {
      label: `${lang.tr('sideMenu.health')} - ${lang.tr('sideMenu.monitoring')}`,
      type: 'goto',
      url: '/server/monitoring',
      permission: { superAdmin: true }
    },
    {
      label: `${lang.tr('sideMenu.health')} - ${lang.tr('sideMenu.alerting')}`,
      type: 'goto',
      url: '/server/alerting',
      permission: { superAdmin: true }
    },
    {
      label: `${lang.tr('sideMenu.health')} - ${lang.tr('sideMenu.debug')}`,
      type: 'goto',
      url: '/server/debug',
      permission: { superAdmin: true }
    },
    {
      label: `${lang.tr('sideMenu.announcements')} - ${lang.tr('sideMenu.latestReleases')}`,
      type: 'goto',
      url: '/latestReleases'
    }
  ]

  const shortcuts: QuickShortcut[] = [
    {
      label: lang.tr('commander.links.documentation'),
      type: 'popup',
      category: 'external',
      url: 'https://botpress.io/docs/introduction/'
    },
    ...adminShortcuts.map((x) => ({ ...x, category: 'admin', location: 'admin' as any }))
  ]

  return shortcuts
}
