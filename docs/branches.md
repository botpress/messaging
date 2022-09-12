# Useful Branches

We use a trunk based development flow when working with Git

## Branches

### master

`master` is our main "production" branch and all PR should end up being merged into this branch.

### v1

The `v1` branch is there to allow making changes to legacy packages (e.g. legacy channels).

### main_backup

`main_backup` is a experimentation that prototyped having all the services (messaging, studio, runtime, webchat) in a single monorepo. This **should only** be seen as an example rather than a working system. You can refer to it as it uses a proper structure and nice tooling (Yarn v3, Parcel, reusable test suites, reusable and optimized CI, etc.) for this kind of project.
