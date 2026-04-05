# Finance frontend

React SPA for the finance product: **login**, **dashboard** and analytics (Recharts), **financial records** (CRUD), **user directory**, and **roles / RBAC** management. It talks to the [Finance Backend API](../server/README.md) over HTTPS with **JWT access tokens** and **refresh tokens** in **HTTP-only cookies** (`withCredentials`).

---

## Tech stack

| Area | Choice |
|------|--------|
| UI | React 19, TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`) |
| Data fetching | TanStack React Query 5 |
| HTTP | Axios (interceptors for silent refresh on `401`) |
| Charts | Recharts |
| Routing | React Router 7 |

---

## Prerequisites

- **Node.js** 20+ recommended (aligns with backend)
- **npm** (or another package manager if you adjust commands)
- A running **backend** (local `server` on port **4000**, or the default deployed API)

---

## Setup

### 1. Install dependencies

From this directory:

```bash
cd client
npm install
```

### 2. API base URL

`src/lib/api.ts` uses:

1. **`VITE_API_BASE_URL`** from the environment (if set), e.g. `http://localhost:4000/api`
2. Otherwise **`https://finance-backend-api.vercel.app/api`**

Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` when developing against a **local** server:

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

Restart `npm run dev` after changing `.env`.

**Important:** If `VITE_API_BASE_URL` is a full URL (localhost or Vercel), the Vite dev **proxy** in `vite.config.ts` is **not** used for those requests—only relative URLs like `/api` would go through the proxy. The env-based base URL is the supported way to switch between local and deployed APIs.

### 3. Run the dev server

```bash
npm run dev
```

Default Vite URL: [http://localhost:5173](http://localhost:5173)

The backend must allow this origin in CORS (already included for `http://localhost:5173` in `server/src/app.ts`). Use **HTTPS** in production for cookies (`Secure` flag).

### 4. Production build

```bash
npm run build
npm run preview
```

---

## App behavior

### Authentication

- **Login** (`POST /auth/login`) stores tokens in cookies; the client does not read token values in JS.
- On **401** (except login/refresh), the client calls **`POST /auth/refresh`** once, queues parallel requests, then retries the original request.
- **Logout** clears session via `POST /auth/logout` and local auth state.

### Route guard and permissions

Routes are wrapped with `ProtectedRoute` and optional permission props (see `src/App.tsx`):

| Path | Permission slug |
|------|------------------|
| `/dashboard` | `dashboard.read` |
| `/records` | `records.read` |
| `/analytics` | `insights.read` |
| `/users` | `users.read` |
| `/roles` | `roles.manage` |

Missing permission → `/unauthorized`. Unauthenticated users are redirected to `/login`.

### Feature pages

- **Dashboard** — summary KPIs and charts (dashboard API).
- **Records** — list, filter, create/edit/delete (subject to `records.*`).
- **Analytics** — trend and category views (`insights.read`).
- **Users** — directory and registration (`users.read` / `users.write`).
- **Roles** — roles, permissions, assign/revoke members (`roles.manage`).

---

## Project layout

```
client/
├── src/
│   ├── components/     # Layout, modals, permission gate
│   ├── context/        # AuthProvider
│   ├── hooks/          # useAuth, useRecords, useDashboard, etc.
│   ├── lib/api.ts      # Axios instance, refresh interceptor
│   ├── pages/          # Login, Dashboard, Records, Users, Roles, Analytics
│   ├── services/       # Thin API wrappers per domain
│   ├── types/          # Shared TS types
│   └── App.tsx         # Routes
├── vite.config.ts
├── vercel.json         # SPA hosting config (if deployed on Vercel)
└── package.json
```

---

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Typecheck + production bundle |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |

---

## Assumptions

- The **browser** and **API** origins are configured for **credentialed CORS** (cookies on cross-site deployments need `SameSite=None; Secure` on the server—already set in the backend).
- **Permission slugs** match the backend seed (`dashboard.read`, `records.read`, `insights.read`, etc.).
- Default production API URL in code matches your deployment; override with `VITE_API_BASE_URL` for staging or local work.

## Tradeoffs

| Decision | Rationale | Limitation |
|----------|-----------|------------|
| Axios + interceptors | Straightforward refresh queueing | Duplicated error handling patterns across services |
| Hardcoded default API URL | Works out of the box against deployed backend | Must set env for local API (now supported via `VITE_API_BASE_URL`) |
| Permission checks on routes | Clear UX for RBAC | Server still enforces permissions; client checks are not security boundaries |
| React Query | Caching and loading states | Query keys must stay consistent when APIs change |

---

## Related documentation

- **[Server README](../server/README.md)** — database setup, env vars, full REST reference, rate limits, troubleshooting.
- **[Workspace README](../README.md)** — how `client` and `server` fit together (if present).

---

## Contact

Questions: `balajivs0305@gmail.com`
