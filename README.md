# habit-tracker monorepo

Monorepo com duas aplicações:

- `backend`: API com Express + TypeScript + Prisma
- `frontend`: app web com React + Vite + TypeScript

## Requisitos

- Node.js `20+`
- npm `10+`
- PostgreSQL
- Docker opcional para dev local

## Desenvolvimento local

Instalação:

```bash
cd "/mnt/d/Vinicius - projects/Habit-tracker"
npm install
```

Sem Docker:

```bash
npm run dev
```

Com Docker:

```bash
npm run dev:docker
```

Parar containers:

```bash
npm run dev:docker:down
```

## Variáveis de ambiente

Backend em `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/habit_tracker?schema=public"
JWT_SECRET="change-me"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
```

Frontend:

```env
VITE_API_URL=http://localhost:3000
```

Em produção, `VITE_API_URL` deve apontar para a URL pública do backend.

## Prisma

Rodar migrations e seed:

```bash
cd backend
npm run prisma:generate
npx prisma migrate deploy
npm run prisma:seed
```

## Deploy

Frontend no Vercel:

```txt
Framework preset: Vite
Root directory: frontend
Build command: npm run build
Output directory: dist
Environment variable: VITE_API_URL=https://seu-backend.onrender.com
```

Backend no Render com Docker:

```txt
Root directory: backend
Dockerfile path: backend/Dockerfile
Environment variables:
- DATABASE_URL
- JWT_SECRET
- JWT_EXPIRES_IN
- CORS_ORIGIN=https://seu-frontend.vercel.app
```

Backend no Render com Node:

```txt
Root directory: backend
Build command: npm install && npm run prisma:generate && npm run build
Start command: npx prisma migrate deploy && npm run start
Environment variables:
- DATABASE_URL
- JWT_SECRET
- JWT_EXPIRES_IN
- CORS_ORIGIN=https://seu-frontend.vercel.app
```

Configuração de CORS para o domínio do Vercel:

- Defina `CORS_ORIGIN` no backend com a URL exata do frontend publicado.
- Exemplo: `CORS_ORIGIN=https://habit-tracker.vercel.app`

## Endpoints úteis

- `GET http://localhost:3000/health`
- `POST /auth/register`
- `POST /auth/login`
- `GET /habits`
- `GET /day?date=YYYY-MM-DD`
- `GET /summary/week?start=YYYY-MM-DD`
