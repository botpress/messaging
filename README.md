# Botpress Messaging

[![npm](https://img.shields.io/npm/v/@botpress/messaging-client?label=%40botpress%2Fmessaging-client)](https://www.npmjs.com/package/@botpress/messaging-client)
[![npm](https://img.shields.io/npm/v/@botpress/messaging-socket?label=%40botpress%2Fmessaging-socket)](https://www.npmjs.com/package/@botpress/messaging-socket)

The botpress messaging server provides a standardized messaging api to communicate with the following channels :

- Messenger
- Slack
- Teams
- Telegram
- Twilio
- Smooch
- Vonage

## Getting started

### Prerequisites

1.  Yarn v1+ (https://yarnpkg.com/)
2.  Docker (https://www.docker.com/) and docker-compose (https://docs.docker.com/compose/)
3.  Install recommended VSCode extensions

### Useful Commands

To start the messaging server, simply run

```sh
> yarn dev
```

_To easily make API calls to the server, use the `misc/api.rest` file_

To create a binary of the Messaging server

```sh
> yarn package
```

To run tests

```sh
> yarn test
```

_Note: to run a specific test suite, add a colon followed by the name of the suite name to the command above (e.g. To run integration tests: `yarn test:int`)_

To lint the codebase

```sh
> yarn eslint
```

To format the codebase

```sh
> yarn prettier
```

To reset the codebase to its initial state

```sh
> yarn reset
```

For all other commands, please refer to the `scripts` of the root `package.json`

## Test Suites

For more information about the different test suites, go [here](./test/README.md).

## Internal Documentation

You can read the internal documentation [here](./docs/readme.md)
