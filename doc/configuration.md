# Configuration

## The `config.json` file

You can configure the server using a `config.json` file. The file must be located inside a `config` folder next to the executable. The `config.json` file is more convenient for local development, and is not necessary to use in production, as all of its configurations can also be achieved with enviornmnent variables.

## Environmnent variables

Environmnent variables have priority over settings configured in the `config.json` file. Every setting avaible in the `config.json` file is also avaible as an environmnent variable so it's not necessary to load the `config.json` (in fact the file can be deleted). An `.env` file in the same directory as the executable can be used to load environment variables.

## List of configurations

| env               | config.json         | Usage                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ----------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NODE_ENV          | none                | Informs the server that it is running in `production` or `development` mode. If in `development` mode, the server will use the repo directory structure to load files (ie: config.json will be load from `res/config.json`)                                                                                                                                                                                                   |
| PORT              | server.port         | Port used by the server. If not set, the server will try to find a unused port starting from 3100                                                                                                                                                                                                                                                                                                                             |
| EXTERNAL_URL      | server.externalUrl  | External url to reach the server. This is used by channels to determine to original url of requests for validation                                                                                                                                                                                                                                                                                                            |
| INTERNAL_PASSWORD | security.password   | Internal password to add an additional security requirement to requests. When a password is set, every api request to the server must supply the internal password in their headers (`password`: `the_internal_password`). The internal password only affects the `/api` routes (channel webhooks are not affected)                                                                                                           |
| ENCRYPTION_KEY    | security.key        | Encryption key used to encrypt channel configurations in the database (with aes-256). This must be a 32 byte key encoded using Base64 (encoding a 32 byte key using Base64 should result in a 44 character long string). Leaving this setting unset will disable encryption for all channel configurations. This setting cannot be changed once you have created data using this key (as the old data will become unreadable) |
| DATABASE_URL      | database.connection | Connection string to the database. Can either be a connection to a PosgresSQL database (ex: `postgres://login:password@your-db-host.com:5432/your-db-name`) or a sqlite file path. If left unset, the server will create an sqlite database named `db.sqlite` in the `data` directory (or in the `dist/data` directory if in `development` mode)                                                                              |
| DATABASE_POOL     | database.pool       | Configuration option for connection pool (ex: `{"min":3,"max":10}`)                                                                                                                                                                                                                                                                                                                                                           |
| CLUSTER_ENABLED   | redis.enabled       | This setting determines if redis is enabled or not. The other redis settings will have no effect if this value is set to false                                                                                                                                                                                                                                                                                                |
| REDIS_URL         | redis.connection    | Connection string to a redis instance (ex: `redis://:your-password@127.0.0.1:6379`). If you want to configure redis for clustering, you can supply an array of connections instead (ex: `[{"host":"localhost","port":7004},{"host":"localhost","port":7001},{"host":"localhost","port":7002}]`)                                                                                                                               |
| REDIS_OPTIONS     | redis.options       | Advances options for redis. Refer to the [ioredis documentation](https://github.com/luin/ioredis/blob/master/API.md) (ex: `{"password":"admin123", "connectTimeout": 20000})`                                                                                                                                                                                                                                                 |
| SKIP_LOAD_CONFIG  | none                | If set to `true`, the server will skip loading any config from the `config.json` file                                                                                                                                                                                                                                                                                                                                         |
| SKIP_LOAD_ENV     | none                | If set to `true`, the server will skip loading any config from the `.env` file                                                                                                                                                                                                                                                                                                                                                |

## Example `config.json` file

```json
{
  "server": {
    "port": 3100,
    "externalUrl": "https://my-hosted-messaging.com"
  },
  "security": {
    "password": "my-super-secret-internal-password123*",
    "key": "this+is+a+test+key+ruwy1UMdKwlwo8n412wCek2w="
  },
  "database": {
    "connection": "postgres://user:password@localhost:5432/myDb",
    "pool": { "min": 3, "max": 10 }
  },
  "redis": {
    "enabled": true,
    "connection": "redis://:my-redis-password@127.0.0.1:6379",
    "options": { "connectTimeout": 20000 }
  }
}
```

## Example `.env` file

```
NODE_ENV=production
PORT=3000
EXTERNAL_URL=https://my-hosted-messaging.com
DATABASE_URL=postgres://user:password@localhost:5432/mydbname
DATABASE_POOL={"min":3,"max":10}
INTERNAL_PASSWORD=my-super-secret-internal-password123*
ENCRYPTION_KEY=this+is+a+test+key+ruwy1UMdKwlwo8n412wCek2w=
CLUSTER_ENABLED=true
REDIS_URL=redis://:my-redis-password@127.0.0.1:6379
REDIS_OPTIONS={"connectTimeout":20000}
```
