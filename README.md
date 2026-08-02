# La quiniela de La Casa de los Famosos

Fantasy pool responsive para predecir el orden completo de eliminación de La Casa de los Famosos.

## Features

- UI moderna inspirada en reality show: dark purple, neon, gold, spotlight cards.
- Cast seed investigado para La Casa de los Famosos México temporada 3/2025.
- Login sin password vía links únicos: `/join/[token]`.
- Un usuario solo puede enviar una quiniela una vez; después queda bloqueada.
- Admin panel en `/admin`:
  - crear usuarios;
  - copiar links únicos;
  - capturar eliminaciones manualmente;
- Leaderboard en vivo en `/`.
- Persistencia server-side usando GitHub Contents API (`data/store.json`) para funcionar en Vercel sin base de datos externa.

## Scoring

Por cada eliminación oficial capturada:

- 125 puntos si el usuario predijo la posición exacta.
- Si no es exacta: `100 - (diferencia de posiciones * 12)`, mínimo 0.

Ejemplo: si alguien puso a un habitante como 3er eliminado y realmente sale 5to, recibe `100 - 24 = 76` puntos.

## Environment variables

```bash
ADMIN_USERNAME=melissa
ADMIN_PASSWORD=change-me-use-a-strong-unique-password
ADMIN_SESSION_SECRET=change-me-use-at-least-32-random-bytes
GITHUB_TOKEN=ghp_...
GITHUB_OWNER=santirosado21-spec
GITHUB_REPO=quiniela-casa-famosos
GITHUB_BRANCH=main
GITHUB_DATA_PATH=data/store.json
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

The GitHub token needs contents read/write permission for this repo. Do not expose it client-side.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open:

- App: `http://localhost:3000`
- Admin: `http://localhost:3000/admin`

## Admin workflow

1. Open `/admin`.
2. Inicia sesión con `ADMIN_USERNAME` y `ADMIN_PASSWORD`. La sesión se guarda en una cookie HttpOnly firmada con `ADMIN_SESSION_SECRET`.
3. Create participants.
4. Copy and send each `/join/[token]` link.
5. Users submit their elimination order once.
6. As eliminations happen, select the contestant and confirm the displayed official position.
7. The leaderboard recalculates automatically.

## Cast note

The initial cast seed is based on public reporting for La Casa de los Famosos México season 3 / 2025. Contestant photos use safe placeholders by default to avoid image licensing issues. Replace `photo_url` in `lib/contestants.ts` with authorized press/brand assets if available.

## Production notes

There is no integration with the show's API. Admin updates eliminations manually. `ADMIN_PASSWORD` must have at least 16 characters and `ADMIN_SESSION_SECRET` at least 32 bytes; example placeholders are deliberately rejected. Login rate limiting is an additional best-effort in-memory defense compatible with Vercel, not a distributed guarantee across instances. The storage strategy is intentionally simple for a private fantasy pool; for high traffic, migrate `lib/store.ts` to Supabase/Postgres and keep the same UI/API contracts.
