FROM node:18-alpine
RUN npm install --global prisma

RUN mkdir /app
WORKDIR /app

COPY ./ ./prisma/
RUN npm init -y

EXPOSE 5556/tcp