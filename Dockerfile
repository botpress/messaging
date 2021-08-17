FROM node:12.18.3-alpine AS build

ADD . /messaging

WORKDIR /messaging/packages/server

RUN yarn build

FROM node:12.18.3-alpine

WORKDIR /messaging

COPY --from=build /messaging/packages/server/dist packages/server/src
COPY --from=build /messaging/packages/server/package.json packages/server/package.json
 
COPY --from=build /messaging/packages/base/dist packages/base/dist
COPY --from=build /messaging/packages/base/package.json packages/base/package.json

COPY --from=build /messaging/package.json package.json
COPY --from=build /messaging/yarn.lock yarn.lock


RUN yarn --silent --prod --frozen-lockfile

ENV NODE_ENV=production

ENTRYPOINT [ "node" ]
CMD ["./packages/server/src/index.js"]