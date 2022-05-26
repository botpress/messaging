FROM node:16.15.0-alpine AS build

ADD . /messaging

WORKDIR /messaging

RUN yarn --immutable
RUN yarn workspace @botpress/messaging-server build

FROM node:16.15.0-alpine

WORKDIR /messaging

COPY --from=build /messaging/packages/messaging/server/dist packages/messaging/server/dist
COPY --from=build /messaging/packages/messaging/server/package.json packages/messaging/server/package.json

COPY --from=build /messaging/packages/messaging/base/dist packages/messaging/base/dist
COPY --from=build /messaging/packages/messaging/base/package.json packages/messaging/base/package.json

COPY --from=build /messaging/packages/messaging/content/dist packages/messaging/content/dist
COPY --from=build /messaging/packages/messaging/content/package.json packages/messaging/content/package.json

COPY --from=build /messaging/packages/messaging/channels/dist packages/messaging/channels/dist
COPY --from=build /messaging/packages/messaging/channels/package.json packages/messaging/channels/package.json

COPY --from=build /messaging/packages/base/framework/dist packages/base/framework/dist
COPY --from=build /messaging/packages/base/framework/package.json packages/base/framework/package.json

COPY --from=build /messaging/packages/base/engine/dist packages/base/engine/dist
COPY --from=build /messaging/packages/base/engine/package.json packages/base/engine/package.json

COPY --from=build /messaging/packages/base/base/dist packages/base/base/dist
COPY --from=build /messaging/packages/base/base/package.json packages/base/base/package.json

COPY --from=build /messaging/package.json package.json
COPY --from=build /messaging/yarn.lock yarn.lock
COPY --from=build /messaging/.yarn/plugins .yarn/plugins
COPY --from=build /messaging/.yarn/releases .yarn/releases
COPY --from=build /messaging/.yarnrc.yml .yarnrc.yml

RUN yarn workspaces focus --all --production

ENV NODE_ENV=production

ENTRYPOINT [ "yarn", "node", "./packages/messaging/server/dist/index.js" ]
CMD []