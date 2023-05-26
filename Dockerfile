FROM node:16
WORKDIR /app

COPY src /app
COPY .env /app

RUN npm install
CMD [ "node", "index.js" ]
