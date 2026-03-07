# habit-tracker monorepo

Monorepo com duas aplicações:

- `backend`: API com Express + TypeScript
- `frontend`: app web com React + Vite + TypeScript

## Requisitos

- Node.js `20+`
- npm `10+` (recomendado)

## Estrutura

```txt
habit-tracker/
  backend/
  frontend/
```

## Setup rápido

1. Instalar dependências do backend:

```bash
cd backend
npm install
```

2. Instalar dependências do frontend:

```bash
cd ../frontend
npm install
```

## Rodando em desenvolvimento

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

## Build e execução

Backend:

```bash
cd backend
npm run build
npm run start
```

Frontend:

```bash
cd frontend
npm run build
npm run start
```

## Lint e format

Backend:

```bash
cd backend
npm run lint
npm run format
```

Frontend:

```bash
cd frontend
npm run lint
npm run format
```

## Healthcheck da API

Com o backend rodando, acessar:

- `GET http://localhost:3000/health`
