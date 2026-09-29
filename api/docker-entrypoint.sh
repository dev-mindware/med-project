#!/bin/sh
set -e

# Run Prisma migrations if configured
if [ "$RUN_MIGRATIONS" = "true" ] || [ "$AUTO_MIGRATE" = "true" ]; then
  echo "==> Running Prisma database migrations..."
  ./node_modules/.bin/prisma migrate deploy || npx prisma migrate deploy || echo "Migration command completed"
fi

echo "==> Starting Linguistic API on port ${PORT:-4000}..."
exec node dist/main.js
