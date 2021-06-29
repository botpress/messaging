# Configuration

## The `config.json` file

You can configure the server using a `config.json` file. The file must be located inside a `config` folder next to the executable. The `config.json` file is more convenient for local development, and is not necessary to use in production, as all of its configurations can also be achieved with enviornmnent variables.

## Environmnent variables

Environmnent variables have priority over settings configured in the `config.json` file. Every setting avaible in the `config.json` file is also avaible as an environmnent variable so it's not necessary to load the `config.json` (in fact the file can be deleted). An `.env` file in the same directory as the executable can be used to load environment variables.

## List of configurations

| env               | config.json        | Usage                                                                                                                                                                                                                                                                                                                        |
| ----------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NODE_ENV          | none               | Informs the server that it is running in `production` or `development` mode. If in `development` mode, the server will use the repo directory structure to load files (ie: config.json will be load from res/config.json)                                                                                                    |
| PORT              | server.port        | Port use by the server. If not set, the server will try to find a unused port starting from 3100                                                                                                                                                                                                                             |
| EXTERNAL_URL      | server.externalUrl | External url to reach the server. This is used by channels to determine to original url of requests for validation                                                                                                                                                                                                           |
| INTERNAL_PASSWORD | security.password  | Internal password to add security requirements to requests. When a password is set, every api request to the server must supply the internal password in their headers (`password`: `the_internal_password`). The internal password only affects the /api routes (channel webhooks are not affected)                         |
| ENCRYPTION_KEY    | security.key       | Encryption key used to encrypt channel configurations in the database. This must be a 32 byte key encoded using Base64. Leaving this setting unset will disable encryption for all channel configurations. This setting cannot be changed once you have created data using this key (as the old data will become unreadable) |
