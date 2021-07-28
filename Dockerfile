FROM node:12.18.3-alpine AS build

ADD . /messaging

WORKDIR /messaging/packages/server

RUN yarn build

FROM node:12.18.3-alpine

COPY --from=build /messaging/packages/server/dist /messaging/server
COPY --from=build /messaging/packages/server/package.json /messaging/package.json
COPY --from=build /messaging/yarn.lock /messaging/yarn.lock

WORKDIR /messaging

RUN yarn --silent --prod

ENV NODE_ENV=production

ENTRYPOINT [ "node" ]
CMD ["./server/index.js"]