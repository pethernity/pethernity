# syntax=docker/dockerfile:1.7

# ---------- build stage ----------
FROM node:20-slim AS builder
WORKDIR /app

# Unica build-arg: l'URL del backend (Vite la inlinea nel bundle).
# Tutto il resto della configurazione (Firebase Web, ecc.) viene fetchato
# a runtime dal backend via GET /config, quindi NON serve come build-arg.
ARG VITE_API_URL=http://localhost:3030
ENV VITE_API_URL=${VITE_API_URL}

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
