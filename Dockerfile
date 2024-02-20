###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:18-alpine As development

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .


RUN npx prisma generate

RUN npm run build

RUN npm install --global prisma


CMD [ "npm", "run", "start:dev" ]



###################
# PRODUCTION
###################


FROM node:18-alpine As production

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .


RUN npx prisma generate
RUN npm run build

RUN npm install --global prisma


CMD [ "npm", "run", "start:prod" ]