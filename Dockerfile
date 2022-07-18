FROM node:alpine3.16

WORKDIR /usr/src/app

COPY . .

RUN yarn

RUN yarn build

CMD ["yarn", "start:prod"]