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
- Whatsapp

## Getting started

### Prerequisites

1.  Yarn v1+ (https://yarnpkg.com/)
2.  Docker (https://www.docker.com/) and docker-compose (https://docs.docker.com/compose/)
3.  Install recommended VSCode extensions
4.  Optionally install [tilt](https://tilt.dev)

### Useful Commands

The simplest way to run the setup locally would be with `tilt`.

```sh
> tilt up
```

Then open http://localhost:10350 to use the tilt UI. `Tilt` will start 4 processes:

1. `messaging`: messaging server (port 3100)
2. `inject-build`: inject script build that watches for changes
3. `inject-serve`: serves the inject script built by the `inject-build` process (port 8080)
4. `webchat`: serves a live version of the webchat that uses the `inject-serve` server (port 3543)

Note: The messaging `client id` inside the file `packages/inject/example.html` needs to be provider manually for now.

Otherwise, to start the messaging server, simply run

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
