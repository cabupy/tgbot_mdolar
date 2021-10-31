# Autor: Carlos Vallejos
# Ultimo LTS a Agosto 2021

# --------------> The build image
FROM node:14 AS build
WORKDIR /usr/src/app
COPY package*.json /usr/src/app/
RUN npm install --production

# --------------> The production image
FROM node:14-alpine
LABEL org.opencontainers.image.source=https://github.com/cabupy/tgbot_mdolar
ENV NODE_ENV production
USER node
WORKDIR /usr/src/app
COPY --chown=node:node --from=build /usr/src/app/node_modules /usr/src/app/node_modules
COPY --chown=node:node . /usr/src/app
CMD npm run start