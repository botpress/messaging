FROM node:16.13.0-alpine AS build

ADD . /messaging

WORKDIR /messaging/packages/server

RUN yarn build

FROM node:16.13.0-alpine

WORKDIR /messaging

COPY --from=build /messaging/packages/server/dist packages/server/src
COPY --from=build /messaging/packages/server/package.json packages/server/package.json

COPY --from=build /messaging/packages/channels/dist packages/channels/dist
COPY --from=build /messaging/packages/channels/package.json packages/channels/package.json

COPY --from=build /messaging/packages/engine/dist packages/engine/dist
COPY --from=build /messaging/packages/engine/package.json packages/engine/package.json
 
COPY --from=build /messaging/packages/base/dist packages/base/dist
COPY --from=build /messaging/packages/base/package.json packages/base/package.json

COPY --from=build /messaging/package.json package.json
COPY --from=build /messaging/yarn.lock yarn.lock


RUN yarn --silent --prod --immutable

ENV NODE_ENV=production

ENTRYPOINT [ "node", "./packages/server/src/index.js" ]
CMD []