FROM node:8.2.1
MAINTAINER fuhuixiang

ADD . /home/sales-system-api
WORKDIR /home/sales-system-api

ENV NODE_ENV production
ENV PORT 2333

RUN npm config set registry https://registry.npm.taobao.org
RUN npm install pm2 -g
RUN pm2 install pm2-intercom
RUN npm install --production

EXPOSE 2333
ENTRYPOINT pm2-docker start ./process.yml
