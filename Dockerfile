FROM node:20-alpine AS development

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

RUN npm i

COPY prisma ./prisma/
RUN npx prisma generate

COPY --chown=node:node . .

USER node

FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

RUN npm run build

ENV NODE_ENV production

RUN npm i  --ignore-scripts && npm cache clean --force

USER node

FROM node:20-alpine AS production

RUN apk add --no-cache tzdata
ENV TZ=ASia/Bangkok

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
COPY --chown=node:node --from=build /usr/src/app/prisma ./prisma
COPY --chown=node:node --from=build /usr/src/app/package*.json ./

CMD [ "node", "dist/src/main.js" ]