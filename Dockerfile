FROM node:8.2.1
MAINTAINER jonnyf

ADD . /home/jonnyf-graphql-api
WORKDIR /home/jonnyf-graphql-api

ENV NODE_ENV production
ENV PORT 2333

RUN npm config set registry https://registry.npm.taobao.org
RUN npm install pm2 -g
RUN pm2 install pm2-intercom
RUN npm install --production

EXPOSE 2333
ENTRYPOINT pm2-docker start ./process.yml
