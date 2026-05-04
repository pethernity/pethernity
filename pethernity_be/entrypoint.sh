#!/bin/sh
set -e

# Applica le migrazioni Prisma se esistono, altrimenti sincronizza con db push.
# In produzione vera è meglio avere prisma/migrations/ versionate (vedi DEPLOY.md).
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  echo "[entrypoint] applying prisma migrations..."
  npx prisma migrate deploy
else
  echo "[entrypoint] WARNING: no prisma/migrations found, falling back to 'prisma db push --accept-data-loss'"
  npx prisma db push --accept-data-loss --skip-generate
fi

exec node dist/server.js
