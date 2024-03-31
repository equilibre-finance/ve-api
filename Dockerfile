FROM node:16.20.2-slim AS base
WORKDIR /app
COPY .env /
ENV NODE_ENV=production
ENV HOME=/app
CMD [ "npm", "start" ]

FROM base AS prod

ENV NODE_ENV=production

COPY ./src/package.json /app/package.json
COPY ./src/yarn.lock /app/yarn.lock

RUN yarn install --production

COPY ./src /app

CMD [ "yarn", "prod" ]

