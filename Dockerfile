FROM node:12.13.0-alpine AS build

ADD . /messaging

WORKDIR /messaging

RUN yarn build

FROM node:12.13.0-alpine

COPY --from=build /messaging/dist /messaging/
COPY --from=build /messaging/package.json /messaging/package.json
COPY --from=build /messaging/package.json /messaging/yarn.lock

WORKDIR /messaging

RUN yarn --silent --prod

ENV NODE_ENV=production

ENTRYPOINT [ "node" ]
CMD ["./index.js"]