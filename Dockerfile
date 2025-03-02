FROM node:20-alpine

WORKDIR /usr/src/app

COPY . .

RUN yarn

RUN yarn build

CMD ["yarn", "start:prod"]