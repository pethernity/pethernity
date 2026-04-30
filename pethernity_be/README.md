# pet-cemetery

Backend TypeScript con **Fastify + Prisma + Swagger** per un cimitero virtuale di animali.

## Entità

- `User` (registrazione/login/me)
- `Headstone` (create/put/delete + claim)
- `Pet` (1:1 con Headstone)

Ogni lapide ha coordinate uniche (`x`,`y`) sulla mappa virtuale.

## Setup rapido

```bash
cp .env.example .env
docker compose up -d postgres
npm install
npm run prisma:generate
npm run prisma:push
npm run dev
```

Swagger UI: `http://localhost:3000/docs`

## API principali

- `POST /auth/register`
- `POST /auth/login` (setta cookie HttpOnly)
- `POST /auth/logout`
- `GET /auth/me`
- `POST /headstones`
- `PUT /headstones/:id`
- `DELETE /headstones/:id`
- `POST /headstones/:id/claim` (acquista/prende una lapide non ancora posseduta)

## Frontend (auth only)

Ho aggiunto un frontend React minimale in `frontend/` con:

- mappa gioco renderizzata con **Phaser 3** (stile pixel-art)
- chiamate API **generate automaticamente** da Swagger/OpenAPI (`openapi-typescript-codegen`)
- import dei tipi Prisma (`User`, `Headstone`, `Pet`) da `@prisma/client`
- auth basata su cookie (`credentials: 'include'`)

Avvio:

```bash
# backend
npm run dev

# frontend
cd frontend
npm install
npm run gen:api
npm run dev
```

## Test integrazione (PostgreSQL in Docker)

Assicurati che PostgreSQL sia attivo:

```bash
docker compose up -d postgres
```

Poi:

```bash
npm test
```

I test coprono:
- auth via cookie (register/login/me)
- create/update/delete headstone con pet
