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

| Command          | Description            |
| ---------------- | ---------------------- |
| `npm run dev`    | Dev server (Turbopack) |
| `npm run build`  | Production build       |
| `npm run lint`   | ESLint                 |
| `npm run format` | Prettier write         |

## Structure

```
src/
  app/            # routes: (shop) storefront, (admin) admin panel, api/auth route handlers
  features/       # domain modules: catalog, cart, orders, auth, ...
  components/ui/  # shared UI primitives
  lib/            # http client, API types, env, utils
```

## Build status

The initial frontend implementation is complete through Phase 11. The phase commits are available in the Git history:

1. **Scaffold** — Next.js 15, Tailwind, TanStack Query, Zustand, and CI.
2. **Typed API layer** — frontend DTO types, HTTP client, and endpoint modules aligned with the backend contract.
3. **Authentication** — login, registration, email verification, session state, and httpOnly refresh-cookie route handlers.
4. **Storefront shell** — shared header, footer, and shop layout.
5. **Catalog** — product listing and details, category pages, brands, and reviews.
   6–7. **Shopping and orders** — cart, checkout, coupons, shipping and payment selection, order history, and order details.
6. **Customer account features** — profile and address book, wishlist, and notifications.
7. **Admin dashboard** — store statistics and order status summary.
8. **Admin order management** — order listing, status updates, cash collection, and refund actions.
9. **Admin coupons** — coupon listing and creation with discount, minimum total, redemption limit, and expiry options.

Latest verification: `npm run typecheck`, `npm run lint`, and `npm run build` pass. This confirms build and static checks; backend-connected flows still require a running backend and appropriate credentials to verify end to end. See the backend repo for the API contract (`/swagger-ui.html`).
