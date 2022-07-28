#FROM keymetrics/pm2:14-slim
#ARG ENV_FILE
## Bundle APP files
#COPY utils utils/
#COPY middleware middleware/
#COPY package.json .
#COPY pm2.json .
#COPY yarn.lock .
#COPY *.js .
#COPY ${ENV_FILE} .env
#
## Install app dependencies
#ENV NPM_CONFIG_LOGLEVEL debug
#RUN yarn install --frozen-lockfile --ignore-engines
#
#COPY .near-credentials /root/.near-credentials/
#COPY pm2.json .
#CMD [ "pm2-runtime", "start", "pm2.json" ]



#FROM node:16
FROM node:lts-alpine3.15
ARG ENV_FILE
# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY utils utils/
COPY middleware middleware/
COPY yarn.lock .
COPY *.js .
COPY ${ENV_FILE} .env
COPY .near-credentials /root/.near-credentials/

EXPOSE 3100
#CMD [ "node", "app.js" ]
CMD [ "yarn", "start" ]