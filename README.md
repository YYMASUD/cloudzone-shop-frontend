# CloudZone Shop — Frontend

Next.js 15 (App Router) storefront and admin dashboard for
[cloudzone-shop-backend](https://github.com/YYMASUD/cloudzone-shop-backend), a Spring Boot 4 /
Java 21 e-commerce API with JWT auth, catalog, cart, wishlist, coupons, orders, payments
(Stripe, Razorpay, PayPal, SSLCommerz, COD), shipping, and notifications.

## Stack

- **Next.js 15** — App Router, TypeScript, Turbopack
- **Tailwind CSS v4** — styling
- **TanStack Query v5** — server state
- **Zustand** — client state (session, cart drawer)
- **React Hook Form + Zod** — forms and validation
- **lucide-react** — icons

## Getting started

```bash
cp .env.example .env.local    # point NEXT_PUBLIC_API_BASE_URL at your backend
npm install
npm run dev                   # http://localhost:3000
```

The backend must be running (see its `compose.yaml`) with this app's origin added to
`app.cors.allowed-origins`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |

## Structure

```
src/
  app/            # routes: (shop) storefront, (admin) admin panel, api/auth route handlers
  features/       # domain modules: catalog, cart, orders, auth, ...
  components/ui/  # shared UI primitives
  lib/            # http client, API types, env, utils
```

## Status

Phase 1 (scaffold) complete. See the backend repo for the API contract (`/swagger-ui.html`).
