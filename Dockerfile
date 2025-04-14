###################
# BUILD STAGE
###################

FROM node:22-alpine AS builder

WORKDIR /app

COPY ./ ./

RUN yarn install

RUN npx prisma generate

RUN yarn build


###################
# PRODUCTION STAGE
###################

FROM node:22-alpine AS production

WORKDIR /app

COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/prisma ./prisma/

USER node

CMD ["sh", "-c", "yarn run db:deploy && yarn run start:prod"]


