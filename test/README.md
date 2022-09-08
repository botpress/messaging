# Test setup

This folder contains the test suites for Jest and Cypress.

Jest is used for unit, integration, security, migration, and backend E2E tests.
While Cypress is currently used for frontend E2E tests with the Webchat.

## Prerequisites

- Docker-compose is needed by the E2E and integration tests as those suites automatically setup all the required services and their requirements so thats they can be run automatically and at any point.

## Usage

To run all test suites:

```sh
> yarn test
```

To run a specific test suite, add a colon followed by the name of the suite name to the command above

```sh
# e.g. To run integration tests
> yarn test:int
```

Here is the list of mapping:

| Suite       | Command          |
| ----------- | ---------------- |
| Unit        | `yarn test:unit` |
| Integration | `yarn test:int`  |
| Migration   | `yarn test:mig`  |
| E2E         | `yarn test:e2e`  |
| Security    | `yarn test:sec`  |
| Webchat     | `yarn test:chat` |
