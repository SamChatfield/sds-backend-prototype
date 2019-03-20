FROM node:10.15.2-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --quiet

COPY . .

CMD npm start
