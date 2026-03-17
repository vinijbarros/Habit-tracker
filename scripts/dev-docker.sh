#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

echo "Starting Docker services..."
docker compose up -d --build

echo "Waiting for backend container..."
until docker compose exec -T backend sh -c 'pwd >/dev/null 2>&1'; do
  sleep 2
done

echo "Applying Prisma migrations..."
docker compose exec -T backend npm run prisma:generate
docker compose exec -T backend npx prisma migrate deploy

echo "Development stack is running."
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:3000/health"
echo "Streaming logs. Press Ctrl+C to stop following logs."

docker compose logs -f
