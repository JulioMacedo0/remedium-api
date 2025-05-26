FROM node:22-alpine as build

# Working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN yarn install

# Copy the application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN yarn run build

# Production Stage
FROM node:22-alpine AS production

# Working directory inside the container
WORKDIR /app

COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/prisma /app/prisma
COPY package*.json ./

# Switch to the non-root user
USER node

# Start the application
CMD ["yarn", "run", "start:prod"]