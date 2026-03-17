FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json

RUN npm ci --workspace backend

COPY backend ./backend

RUN npx prisma generate --schema backend/prisma/schema.prisma

EXPOSE 3000

CMD ["sh", "-c", "cd /app/backend && npx prisma generate && npm run dev"]
