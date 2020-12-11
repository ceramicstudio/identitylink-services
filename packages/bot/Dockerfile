FROM node:12
WORKDIR /usr/src/bot
COPY package*.json ./
RUN yarn install --production
COPY . .
EXPOSE 8080
CMD [ "node", "src/bot.js" ]
