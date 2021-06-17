import { ClusterNode, ClusterOptions, RedisOptions } from 'ioredis'

export interface RedisConfig {
  enabled: boolean
  connection: string | ClusterNode[]
  options: RedisOptions | ClusterOptions
}
