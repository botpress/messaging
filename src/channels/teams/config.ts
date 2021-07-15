export interface TeamsConfig {
  enabled: boolean
  appId: string
  appPassword: string
  tenantId: string
  proactiveMessages: {
    [Key: string]: string
  }
}
