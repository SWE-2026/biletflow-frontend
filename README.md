# BiletFlow Frontend

Web app for BiletFlow, a self-service event ticketing platform for Kazakhstan, used by attendees,
organizers and platform admins. Built with React 19, TypeScript, Vite, React Router and Tailwind CSS.

## Run it

1. Start the API from [`../biletflow-api`](../biletflow-api) (Postgres, storage and the API on
   http://localhost:8080, in local mode):

   ```bash
   docker compose up --build
   ```

2. Install dependencies and start the dev server:

   ```bash
   npm install
   npm run dev
   ```

3. Open http://localhost:5173.

The API runs in local mode, so sign-in codes are not emailed: the app shows them on screen with a
"Local mode" label.

## Configuration

Settings are read at build time from environment variables. To change them, create `.env.local`
(git-ignored) in this folder:

```bash
VITE_API_URL=http://localhost:8080/api/v1
```

| Variable | Default | Meaning |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080/api/v1` | API base URL, including `/api/v1` |
| `VITE_GA_MEASUREMENT_ID` | none | turns on Google Analytics 4; nothing loads without it |

If the dev server runs on a port other than 5173, add that origin to the API's `CORS_ORIGINS`, or
the browser will block its requests.

To open the web app from a phone or emulator (for example inside the mobile app), make it listen
on your network:

```bash
npm run dev -- --host
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | dev server with hot reload |
| `npm run build` | typecheck and production build into `dist/` |
| `npm run preview` | serve the production build locally |
| `npm run typecheck` | TypeScript check only |
| `npm run lint` | oxlint and Steiger (Feature-Sliced Design rules) |
| `npm test` | unit tests in `tests/` (Node test runner) |

## Project layout

The code in `src/` follows [Feature-Sliced Design](https://feature-sliced.design):
`app`, `pages`, `widgets`, `features`, `entities` and `shared`. Routes are defined in
`src/app/router/router.tsx`. The API contract is in
[`../biletflow-api/docs/api.md`](../biletflow-api/docs/api.md).
