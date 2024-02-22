FROM node:18-alpine As production
RUN npm install --global prisma

RUN mkdir /app
WORKDIR /app

COPY ./ ./prisma/
RUN npm init -y

EXPOSE 5556/tcp


FROM node As development
RUN npm install --global prisma

RUN mkdir /app
WORKDIR /app

COPY ./ ./prisma/
RUN npm init -y

EXPOSE 5556/tcp