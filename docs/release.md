# Release

Here is the documentation on how to release a new version of either the messaging server, the webchat, or any of its packages.

_Note: we use semantic versioning for all the versions mentioned below._

## Messaging server

To release a new version of the messaging server, follow these steps:

1.  Bump the version of the **root** and **packages/server** `package.json` to the same version.
1.  Push those changes to master
1.  Manually trigger action named `Create Release Pull Request`. This PR will generate a Pull Request
1.  Review, approve and merge the newly created PR.
1.  That's it, the new version of messaging is published!

## Webchat

The webchat is automatically deployed on the **Cloud Staging environment** when a new commit is pushed on **master**. To deploy a new version in **production**, you will need to manually trigger the `Upload Webchat Production` action.

## Packages

To publish a new version of any of the different packages we have (e.g. Components, Client, etc.), follow these steps:

_Note: These steps requires you to have write access on the @botpress NPM org_

1. Make sure you are logged into NPM with Yarn. Run `yarn npm login` if not.
1. In a terminal, go to the package you want to publish a new version of.
1. Run `yarn version <patch|minor|major>` to bump the version of the package. _Note that this step is the easiest and most efficient way to bump the package and it's reference on dependent packages. E.g. if you run `yarn version patch` on the components package, it will also change the version of the dependency on the webchat as this package depends on components._
1. Now that you are ready to publish the package, run `yarn npm publish --access public`.
1. Make sure to commit your changes and push them on GitHub.
1. You will receive a confirmation that the new version was published on your Email. You can also validate that this is the case by searching the package name on [NPM](https://www.npmjs.com/).
