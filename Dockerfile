FROM node:16
WORKDIR /app
COPY .env /
ENV NODE_ENV=production
ENV HOME=/app
CMD [ "npm", "start" ]
