FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json

RUN npm ci --workspace frontend

COPY frontend ./frontend

EXPOSE 5173

CMD ["sh", "-c", "cd /app/frontend && npm run dev -- --host 0.0.0.0 --port 5173"]
