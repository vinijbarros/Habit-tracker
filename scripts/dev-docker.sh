#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

echo "Starting Docker services..."
docker compose up -d --build

echo "Development stack is running."
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:3000/health"
echo "Postgres: localhost:5432"
echo "Streaming logs. Press Ctrl+C to stop following logs."

docker compose logs -f
