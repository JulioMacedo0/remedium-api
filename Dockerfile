###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:18-alpine As development

WORKDIR /app

COPY .env ./

COPY package*.json ./

RUN yarn install

COPY . .


RUN npx prisma generate

RUN yarn build

RUN yarn global add prisma


CMD ["sh", "-c", "npx prisma db push --skip-generate && yarn start:dev"]



###################
# PRODUCTION
###################


FROM node:18-alpine As production

WORKDIR /app

COPY .env ./

COPY package*.json ./

RUN  yarn install

COPY . .


RUN npx prisma generate
RUN yarn build

RUN npm install --global prisma

USER node

CMD ["sh", "-c", "npx prisma db push --skip-generate && yarn start:prod"]
