export interface BotpressEnvironmentVariables {
  readonly STUDIO_PORT?: number
  readonly CORE_PORT?: number
  readonly ROOT_PATH?: string

  readonly APP_SECRET?: string
  readonly INTERNAL_PASSWORD?: string

  /** The URL exposed by Botpress to external users (eg: when displaying links) */
  readonly EXTERNAL_URL?: string

  /**
   * Set this to true if you're exposing Botpress through a reverse proxy such as Nginx
   * Can also be either an IP address or a hostname
   * Read more: https://expressjs.com/en/guide/behind-proxies.html
   */
  readonly REVERSE_PROXY?: string

  /** Use this proxy connection string to access external services, like Duckling and Licensing
   *  This values overwrites the value defined in the global Botpress configuration
   * @example http://username:password@hostname:port
   */
  readonly BP_PROXY?: string

  /**
   * Disable the use of GZIP compression while serving assets to the end users
   */
  readonly BP_HTTP_DISABLE_GZIP?: boolean

  /**
   * Use to set default debug namespaces
   * @example bp:dialog:*,bp:nlu:intents:*
   */
  readonly DEBUG?: string

  /**
   * Overrides the auto-computed `process.APP_DATA_PATH` path
   * @see Process.APP_DATA_PATH
   */

  readonly APP_DATA_PATH?: string

  /**
   * Truthy if running the official Botpress docker image
   */
  readonly BP_IS_DOCKER?: boolean

  /**
   * The max size of the in-memory, in-process cache.
   * Defaults to '1gb'
   */
  readonly BP_MAX_MEMORY_CACHE_SIZE?: string

  /**
   * Prevents Botpress from closing cleanly when an error is encountered.
   * This only affects fatal errors, it will not affect business rules checks (eg: licensing)
   */
  readonly BP_FAILSAFE?: boolean

  /**
   * Overrides the maximum file size allowed for the BPFS
   * @default 100mb
   */
  readonly BP_BPFS_MAX_FILE_SIZE?: string

  readonly BP_DEBUG_SEGMENT?: boolean

  /*
   * endpoint of cloud controller API
   */
  readonly CLOUD_CONTROLLER_ENDPOINT?: string
}
export interface IDebug {
  (module: string, botId?: string): IDebugInstance
}

export interface IDebugInstance {
  readonly enabled: boolean

  (msg: string, extra?: any): void
  /**
   * Use to print a debug message prefixed with the botId
   * @param botId The bot Id
   * @param message The debug message
   */
  forBot(botId: string, message: string, extra?: any): void
  sub(namespace: string): IDebugInstance
}

declare global {
  let printErrorDefault: (err: Error) => void
  let DEBUG: IDebug
  let rewire: (name: string) => string
  let printBotLog: (botId: string, args: any[]) => void
  let printLog: (args: any[]) => void

  namespace NodeJS {
    export interface Process {
      VERBOSITY_LEVEL: number
      IS_PRODUCTION: boolean // TODO: look to remove this
      APP_SECRET: string
      /**
       * Path to the global APP DATA folder, shared across all installations of Botpress Server
       * Use this folder to store stuff you'd like to cache, like NLU language models etc
       */
      APP_DATA_PATH: string
      HOST: string
      PORT: number
      PROXY?: string
      EXTERNAL_URL: string
      LOCAL_URL: string
      /** This is the subfolder where Botpress is located (ex: /botpress/). It is extracted from the external URL */
      ROOT_PATH: string
      /** Path to the studio executable */
      STUDIO_LOCATION: string
      /** Location of the bots/, global/ and storage/ folders à */
      DATA_LOCATION: string
      LOADED_MODULES: { [module: string]: string }
      pkg: any
      STUDIO_VERSION: string
      TELEMETRY_URL: string
      core_env: BotpressEnvironmentVariables
      IS_FAILSAFE: boolean
      NLU_ENDPOINT?: string
      CLOUD_OAUTH_ENDPOINT: string
      CLOUD_CONTROLLER_ENDPOINT: string
      CLOUD_NLU_ENDPOINT: string
    }
  }
}
