FROM node:18
RUN npm install --global prisma

RUN mkdir /app
WORKDIR /app

COPY ./* ./prisma/
RUN npm init -y

EXPOSE 5555/tcp