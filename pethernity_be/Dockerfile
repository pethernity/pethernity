# syntax=docker/dockerfile:1.7

# ---------- build stage ----------
FROM node:20-slim AS builder
WORKDIR /app

# OpenSSL serve a Prisma per generare il client
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---------- runtime stage ----------
FROM node:20-slim AS runtime
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production \
    PORT=8080
EXPOSE 8080

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package.json ./
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Cloud Run invia SIGTERM al graceful shutdown.
# Fastify gestisce la chiusura con app.close() — già coperto da fastify-shutdown integrato in v4.
CMD ["./entrypoint.sh"]
