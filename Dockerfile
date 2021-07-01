FROM node:12.13.0

ADD . /messaging

WORKDIR /messaging

RUN yarn build

ENV NODE_ENV=production

CMD ["node", "./dist"]