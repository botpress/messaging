FROM node:16.13.2-alpine

WORKDIR /app

COPY . /app

RUN yarn --immutable

WORKDIR /app/packages/webchat

RUN yarn build
RUN mv ./dist /dist
