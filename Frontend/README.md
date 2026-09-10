# SewaNepal — Frontend

Production-ready React frontend for the Local Service Marketplace (Django REST backend). Built with Vite + React + Tailwind, role-aware dashboards, and real Khalti KPG-2 payments.

## Tech Stack

- **React 19** + **Vite 8** + **React Router 7**
- **Tailwind CSS 3** + custom design tokens (SewaNepal theme)
- **Axios** with JWT interceptor + auto-refresh
- **Zustand** for auth state
- **Lucide Icons**, `date-fns`

## Quick Start

```bash
cd Frontend
npm install
cp .env.example .env   # set VITE_API_URL
npm run dev            # http://localhost:5173
npm run build          # production build -> dist/
```

`VITE_API_URL` defaults to `http://127.0.0.1:8000/api` — must match `CORS_ALLOWED_ORIGINS` in `Backend/.env`.

## Project Structure

```
src/
  api/client.js          # axios instance, refresh logic
  stores/authStore.js    # zustand auth (login, me, logout)
  components/
    ui/                  # Button, Input, Card, Badge, Skeleton
    layout/              # Navbar, Footer, Layout, DashboardLayout
  pages/
    Home.jsx, Services.jsx, ServiceDetail.jsx, Providers.jsx, ProviderDetail.jsx
    Login.jsx, Register.jsx
    customer/            # Overview, Bookings, Payments, Reviews, Profile
    provider/            # Overview, Services, Availability, Bookings, Earnings, Profile
    admin/               # Overview, Providers, Categories, Bookings, Payments, Reports, Analytics
    shared/              # Notifications, Reports, PaymentCallback
  hooks/useRequireAuth.jsx
```

## Features

- **Public**: landing with hero search, categories, featured services, provider radius search (lat/lon + km), service detail with reviews & booking form.
- **Auth**: register (CUSTOMER/PROVIDER), login (JWT), refresh, role-based redirects.
- **Customer dashboard**: profile (customers app), bookings (create/cancel), payments (create/initiate/verify via Khalti), reviews (one per completed booking), notifications & reports.
- **Provider dashboard**: profile with auto-geocoding, services CRUD (verified gate), availability slots (no overlap), bookings (accept/reject/complete), earnings.
- **Admin dashboard**: live stats + snapshots, category CRUD, provider verification, bookings/payments/reports overview.
- **Payments**: `POST /payments/<id>/initiate/` → redirect to `payment_url` → return to `/payment/callback?pidx=…` → `POST /payments/<id>/verify/` (server-verified lookup).
- **Notifications**: polling, mark read, type badges.
- **Responsive**, **accessible**, **production build-tested**.

## Backend Requirements

Backend running on `http://127.0.0.1:8000` with:

```env
CORS_ALLOWED_ORIGINS=http://localhost:5173
KHALTI_SECRET_KEY=...
KHALTI_RETURN_URL=http://localhost:5173/payment/callback
```

See `Backend/README.md` and `http://127.0.0.1:8000/api/docs/` for API docs.

## Khalti Sandbox

Test wallet: `9800000000` – `9800000005`, MPIN `1111`, OTP `987654`. Use "Khalti Wallet" — cards/eBanking not supported in sandbox. Flow is server-verified; client status never trusted.

## Deployment

- Set `VITE_API_URL` to production API.
- `npm run build` → deploy `dist/` to Vercel/Netlify/Nginx.
- Ensure backend `CORS_ALLOWED_ORIGINS` includes frontend origin.

## Roles

- **CUSTOMER** — book, pay, review.
- **PROVIDER** — requires profile + admin verification to list services.
- **ADMIN** — manage categories, verify providers, view analytics (created via `python manage.py createsuperuser` + set role to ADMIN).

