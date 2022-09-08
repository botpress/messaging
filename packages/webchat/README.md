# Webchat

### Sending

| Channels | Webchat | Details |
| -------- | :-----: | :------ |
| Text     |   ✅    |         |
| Image    |   ✅    |         |
| Choice   |   ✅    |         |
| Dropdown |   ✅    |         |
| Card     |   ✅    |         |
| Carousel |   ✅    |         |
| File     |   ✅    |         |
| Audio    |   ✅    |         |
| Video    |   ✅    |         |
| Location |   ✅    |         |

### Receiving

| Channels      | Webchat | Details |
| ------------- | :-----: | :------ |
| Text          |   ✅    |         |
| Quick Reply   |   ✅    |         |
| Postback      |   ✅    |         |
| Say Something |   ✅    |         |
| Voice         |   ✅    |         |
| Image         |   ❌    |         |
| File          |   ❌    |         |
| Audio         |   ❌    |         |
| Video         |   ❌    |         |
| Location      |   ❌    |         |

## Development

When working on the webchat, to see changes made to the codebase, you will need to follow the steps detailed [here](../inject/README.md). The inject script is the part that links any web page to a webchat. This is the easiest way to manually test the webchat.

## Tests

To run automated E2E tests, simply run the command `yarn test:chat [--browser <chromium | firefox | edge | electron>]` (for the list of supported browsers see: https://docs.cypress.io/guides/guides/launching-browsers#Browsers).

Tests can be found in `tests/e2e` and uses Cypress as the test framework. Configurations for Cypress can be found in the `cypress.json` file at the root of the repository.
