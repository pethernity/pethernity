# syntax=docker/dockerfile:1.7

# ---------- build stage ----------
FROM node:20-slim AS builder
WORKDIR /app

# Le VITE_* vengono inlinete nel bundle al build time, quindi vanno passate
# come build args (--build-arg) e non come runtime env.
# Su Cloud Run "Continuously deploy from a repository", impostali in
# "Build environment variables".
ARG VITE_API_URL=http://localhost:3030
ARG VITE_FIREBASE_API_KEY=""
ARG VITE_FIREBASE_AUTH_DOMAIN=""
ARG VITE_FIREBASE_PROJECT_ID=""
ARG VITE_FIREBASE_APP_ID=""
ARG VITE_FIREBASE_MESSAGING_SENDER_ID=""

ENV VITE_API_URL=${VITE_API_URL} \
    VITE_FIREBASE_API_KEY=${VITE_FIREBASE_API_KEY} \
    VITE_FIREBASE_AUTH_DOMAIN=${VITE_FIREBASE_AUTH_DOMAIN} \
    VITE_FIREBASE_PROJECT_ID=${VITE_FIREBASE_PROJECT_ID} \
    VITE_FIREBASE_APP_ID=${VITE_FIREBASE_APP_ID} \
    VITE_FIREBASE_MESSAGING_SENDER_ID=${VITE_FIREBASE_MESSAGING_SENDER_ID}

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- runtime stage ----------
FROM caddy:2-alpine AS runtime

COPY --from=builder /app/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile

# Cloud Run espone $PORT (default 8080); Caddyfile lo legge tramite {$PORT:8080}
EXPOSE 8080
