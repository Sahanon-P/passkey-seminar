# multi stage build
FROM node:20-bookworm-slim AS build

 
USER node
WORKDIR /app
 
COPY package.json ./
RUN yarn 
 
COPY ./src ./src
COPY ./prisma ./prisma
COPY tsconfig.json ./
RUN yarn prisma generate
RUN yarn build
 
FROM node:20-bookworm-slim
 
RUN apt-get update -y \
    && apt-get install -y openssl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
USER node
WORKDIR /app
 
COPY --from=build \
    /app/package*.json \
    /app/prisma/schema.prisma \
    /app/
COPY --from=build /app/dist /app/dist/
COPY --from=build /app/node_modules /app/node_modules/
 
EXPOSE 3000
CMD  ["node", "/app/dist/main.js"]