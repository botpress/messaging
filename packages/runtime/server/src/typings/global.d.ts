declare namespace NodeJS {
  export interface ExtraRequire {
    addToNodePath(path: string): void
    getPaths(): string[]
    overwritePaths(paths: string[])
  }

  export interface Global {
    printErrorDefault(err: unknown): void
    DEBUG: IDebug
    BOTPRESS_CORE_EVENT: IEmitCoreEvent
    BOTPRESS_CORE_EVENT_TYPES: BotpressCoreEvents
    require: ExtraRequire
    rewire: (name: string) => string
    printBotLog(botId: string, args: any[]): void
    printLog(args: any[]): void
  }

  export interface Process {
    VERBOSITY_LEVEL: number
    IS_PRODUCTION: boolean // TODO: look to remove this
    BPFS_STORAGE: 'database' | 'disk'
    APP_SECRET: string
    HOST: string
    PORT: number
    EXTERNAL_URL: string
    LOCAL_URL: string
    IS_STANDALONE: boolean
    PROJECT_LOCATION: string
    LOADED_MODULES: { [module: string]: string }
    pkg: any
    IS_LICENSED?: boolean
    CLUSTER_ENABLED: boolean
    ASSERT_LICENSED?: Function
    TELEMETRY_URL: string
    BOTPRESS_VERSION: string
    runtime_env: RuntimeEnvironmentVariables
    distro: OSDistribution
    BOTPRESS_EVENTS: any
    AUTO_MIGRATE: boolean
    MIGRATE_CMD?: 'up' | 'down'
    MIGRATE_TARGET?: string
    MIGRATE_DRYRUN?: boolean
    IS_FAILSAFE: boolean
    /** A random ID generated on server start to identify each server in a cluster */
    SERVER_ID: string
    DISABLE_GLOBAL_SANDBOX: boolean
    DISABLE_BOT_SANDBOX: boolean
    DISABLE_TRANSITION_SANDBOX: boolean
    DISABLE_CONTENT_SANDBOX: boolean

    // The internal password is used for inter-process communication
    INTERNAL_PASSWORD: string

    OAUTH_ENDPOINT?: string
    /** These two endpoints may either be provided as environment variables (when standalone) or from the main process */
    NLU_ENDPOINT?: string
    MESSAGING_ENDPOINT?: string
    MESSAGING_SESSION_COOKIE_NAME?: string
    SDK_RATE_LIMIT?: string
  }
}

declare var process: NodeJS.Process
declare var global: NodeJS.Global

/**
 * This is a copy of process.env to add typing and documentation to variables
 */
declare interface RuntimeEnvironmentVariables {
  /** Replace the path of the NodeJS Native Extensions for external OS-specific libraries such as fastText and CRFSuite */
  readonly NATIVE_EXTENSIONS_DIR?: string

  /** Change the BPFS storage mechanism ("database" or "disk"). Defaults to "disk" */
  readonly BPFS_STORAGE?: 'database' | 'disk'

  /** The URL exposed by Botpress to external users (eg: when displaying links) */
  readonly EXTERNAL_URL?: string

  /** A custom URL where bot medias will be served. Format: MEDIA_URL/botId/assetName */
  readonly MEDIA_URL?: string

  /** The URL used to reach OAuth */
  readonly OAUTH_ENDPOINT?: string

  /** The URL used to reach an external Messaging server */
  readonly MESSAGING_ENDPOINT?: string

  /** Name of the cookie for sticky sessions on messaging */
  readonly MESSAGING_SESSION_COOKIE_NAME?: string

  /** Options for sdk rate limiting (JSON) */
  readonly SDK_RATE_LIMIT?: string

  /** The URL used to reach an external NLU server */
  readonly NLU_ENDPOINT?: string

  /** Use this to override the hostname that botpress will listen on (by default it's localhost) - replaces httpServer.host */
  readonly BP_HOST?: string

  /** Change the port where botpress listens. Replaces the configuration of httpServer.port */
  readonly PORT?: number

  /**
   * The connection string for redis
   * @example redis://username:password@localhost:6379
   */
  readonly REDIS_URL?: string

  /**
   * The scope or channel prefix used by RedisIO to differentiate multiple clusters of Botpress using the same Redis Cluster.
   * See: https://redis.io/topics/pubsub#database-amp-scoping
   * @example production, staging, test, development, botpress1, ...
   */
  readonly BP_REDIS_SCOPE?: string

  /**
   * The database connection string. The first part indicates which database to use
   * @example postgres://user:pass@host/db
   */
  readonly DATABASE_URL?: string

  /** When running botpress in production, some optimizations are applied */
  readonly BP_PRODUCTION?: boolean

  /** Enable cluster mode */
  readonly CLUSTER_ENABLED?: boolean

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

  /** Enable performance hooks to track incoming and outgoing events */
  readonly BP_DEBUG_IO?: boolean

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
   * When set to true, Botpress will not automatically restart on crash
   * @default false
   */
  readonly BP_DISABLE_AUTO_RESTART?: boolean

  /**
   * Define the maximum number of time the server will be automatically restarted.
   * @default 5
   */
  readonly BP_MAX_SERVER_REBOOT?: number

  /**
   * Disable API calls to the serverConfig endpoint (which may return sensitive data - only for super admins
   * @default false
   */
  readonly BP_DISABLE_SERVER_CONFIG?: boolean

  /**
   * Disable API call to generate a diagnostic report. Command line/environment variables will still work
   * @default false
   */
  readonly BP_DISABLE_SERVER_DIAG?: boolean

  /**
   * Prevents Botpress from closing cleanly when an error is encountered.
   * This only affects fatal errors, it will not affect business rules checks (eg: licensing)
   */
  readonly BP_FAILSAFE?: boolean

  /** When true, Redis will be used to keep active sessions in memory for better performances */
  readonly USE_REDIS_STATE?: boolean

  /**
   * Experimental feature which will try to load actions locally, then from the ghost
   */
  readonly BP_EXPERIMENTAL_REQUIRE_BPFS?: boolean

  /**
   * When true, all hooks and GLOBAL actions are executed outside the sandbox.
   * Can give a significant performance improvement but removes some protections.
   */
  readonly DISABLE_GLOBAL_SANDBOX?: boolean

  /** When true, bot-scoped actions and hooks are executed outside of the sandbox  */
  readonly DISABLE_BOT_SANDBOX?: boolean

  /** When true, transitions are executed outside of the sandbox  */
  readonly DISABLE_TRANSITION_SANDBOX?: boolean

  /** When true, content elements rendering will be executed outside of the sandbox */
  readonly DISABLE_CONTENT_SANDBOX?: boolean

  /**
   * Overrides the maximum file size allowed for the BPFS
   * @default 100mb
   */
  readonly BP_BPFS_MAX_FILE_SIZE?: string

  /**
   * Overrides the maximum concurrency for BPFS upload
   * @default 50
   */
  readonly BP_BPFS_UPLOAD_CONCURRENCY?: number

  /** Runs all migrations from v12.0.0 up to the latest migration found in modules and core */
  readonly TESTMIG_ALL?: boolean

  /** Runs future migrations, ignore completed migrations & sets the config version to the version in package.json */
  readonly TESTMIG_NEW?: boolean

  /** Migration Testing: Simulate a specific version for the server, ex: 12.5.0 */
  readonly TESTMIG_BP_VERSION?: string

  /** Migration Testing: Simulate a specific version for the configuration file, ex: 12.4.0 */
  readonly TESTMIG_CONFIG_VERSION?: string

  /** Migration Testing: Set this to true to run completed migrations everytime the server starts */
  readonly TESTMIG_IGNORE_COMPLETED?: boolean

  /**
   * Supports dumb deployments by allowing disabling file listeners
   */
  readonly CORE_DISABLE_FILE_LISTENERS?: boolean
}

interface IDebug {
  (module: string, botId?: string): IDebugInstance
}

interface IDebugInstance {
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

declare var DEBUG: IDebug

declare interface OSDistribution {
  os: NodeJS.Platform
  /** The distribution, e.g. "centos", "ubuntu" */
  dist: string
  /** If a codename is available, for example "final" or "alpine" */
  codename: string
  /** The release number, for example 18.04 */
  release: string
}

declare interface Dic<T> {
  [Key: string]: T
}

declare interface BotpressCoreEvents {
  bp_core_session_created: { botId: string; channel: string }
  bp_core_send_content: { botId: string; channel: string; source: string; details: string }
  bp_core_enter_flow: { botId: string; channel: string; flowName: string }
  bp_core_feedback_positive: { botId: string; channel: string; type: string; details?: string; eventId?: string }
  bp_core_feedback_negative: { botId: string; channel: string; type: string; details?: string; eventId?: string }
}

interface IEmitCoreEvent {
  <T extends keyof BotpressCoreEvents>(
    event: T,
    args: { [key in keyof BotpressCoreEvents[T]]: BotpressCoreEvents[T][key] }
  ): void
}

declare var BOTPRESS_CORE_EVENT: IEmitCoreEvent
