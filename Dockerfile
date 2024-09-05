# FROM node:alpine
# FROM node:16-alpine3.15
FROM keymetrics/pm2:14-alpine


# Create app directory
WORKDIR /usr/src/app

COPY package.json .

RUN apk update && apk add --no-cache python3 py3-pip  make g++
# RUN apk add --update python make g++
RUN npm install -g node-gyp
RUN npm install

COPY . .

EXPOSE 5080

CMD ["pm2-docker", "cw-pm2.json"]