FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN npm install --global prisma

RUN npx prisma generate

CMD [ "npm", "run", "start:dev" ]