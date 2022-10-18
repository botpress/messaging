FROM node:16.13.2-alpine AS build

ADD . /messaging

WORKDIR /messaging

RUN yarn --immutable
RUN yarn build

FROM node:16.13.2-alpine

WORKDIR /messaging

COPY --from=build /messaging/packages/server/dist packages/server/dist
COPY --from=build /messaging/packages/server/package.json packages/server/package.json

COPY --from=build /messaging/packages/channels/dist packages/channels/dist
COPY --from=build /messaging/packages/channels/package.json packages/channels/package.json

COPY --from=build /messaging/packages/framework/dist packages/framework/dist
COPY --from=build /messaging/packages/framework/package.json packages/framework/package.json

COPY --from=build /messaging/packages/engine/dist packages/engine/dist
COPY --from=build /messaging/packages/engine/package.json packages/engine/package.json
 
COPY --from=build /messaging/packages/base/dist packages/base/dist
COPY --from=build /messaging/packages/base/package.json packages/base/package.json

COPY --from=build /messaging/package.json package.json
COPY --from=build /messaging/yarn.lock yarn.lock
COPY --from=build /messaging/.yarn/plugins .yarn/plugins
COPY --from=build /messaging/.yarn/releases .yarn/releases
COPY --from=build /messaging/.yarnrc.yml .yarnrc.yml

RUN yarn workspaces focus --all --production

ENV NODE_ENV=production

ENTRYPOINT [ "yarn", "node", "-r", "@bpinternal/trail/init", "./packages/server/dist/index.js" ]
CMD []
