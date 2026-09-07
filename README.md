# Local Service Marketplace — Backend

A Django REST Framework backend for a platform connecting customers with
verified local service providers (plumbers, electricians, tutors, etc.)
in Nepal. Built as an internship project demonstrating full-stack API
design, role-based auth, location-based search, booking workflows, and
real payment gateway integration.

## Features

- **Three user roles** — Customer, Provider, Admin — each with tailored
  permissions and workflows
- **JWT authentication** with role-based access control
- **Location-based search** — radius search using real geocoded
  coordinates (no manual lat/long entry required)
- **Full booking lifecycle** — request → accept/reject → complete →
  pay → review, with state transitions enforced server-side
- **Real payment gateway integration** — Khalti ePayment (KPG-2),
  server-verified via Khalti's lookup API (no client-trusted "success"
  flags)
- **Background jobs** — automatic booking reminders and daily analytics
  snapshots, no external services required (runs in-process via
  APScheduler)
- **Reviews & ratings**, **admin dashboard/analytics**, **complaints/reports**,
  **in-app notifications** — see [Modules](#modules) below

## Proposal Coverage

This project was built against a formal proposal (see original spec).
Everything listed there is implemented and tested; a couple of items
were adapted for a solo internship-scale build, noted below.

| Proposal Requirement | Status | Notes |
|---|---|---|
| Auth, role-based access (Customer/Provider/Admin) | ✅ Done | JWT via `accounts` app |
| Customer/Provider/Admin management | ✅ Done | |
| Service categories & listings | ✅ Done | |
| Search & filtering (category, price, location) | ✅ Done | |
| Location-based search | ✅ Done | Real haversine radius search |
| Geocoding (address → coordinates) | ✅ Done | Uses OpenStreetMap Nominatim instead of Google Maps — free, no billing setup, same result |
| Availability management | ✅ Done | |
| Booking workflow with state transitions | ✅ Done | Pending → Accepted/Rejected → Completed |
| Payment gateway integration | ✅ Done | Khalti (KPG-2) — real sandbox integration, not mocked. eSewa not yet implemented |
| Reviews & ratings | ✅ Done | One review per completed booking, enforced server-side |
| Notifications | ✅ Done | In-app, auto-created on booking/payment/review events |
| Background jobs (reminders, scheduled tasks) | ✅ Done | Implemented with APScheduler instead of Celery + Redis — same outcome, no extra infrastructure to run locally |
| Complaints / Reports | ✅ Done | |
| Admin dashboard & analytics | ✅ Done | Live dashboard endpoint + daily historical snapshots |

### Deliberate deviations from the original proposal

- **Celery + Redis → APScheduler.** The proposal's tech stack table
  specified Celery + Redis for background jobs. This was built and
  tested with Celery + Redis first, but switched to APScheduler
  (in-process scheduling) to avoid requiring a separate Redis/broker
  service for local development. Functionally equivalent for a
  demo-scale deployment; noted as a candidate to revisit for a
  multi-server production deployment.
- **Google Maps → OpenStreetMap Nominatim.** Same reasoning — avoids
  requiring a billed API key for a student project. Swappable later
  by replacing `providers/geocoding.py` only.
- **eSewa not implemented.** Only Khalti was built out, to keep one
  gateway fully real/tested rather than two partially mocked ones.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Django 6.1 + Django REST Framework |
| Database | SQLite (dev) |
| Auth | JWT (`djangorestframework_simplejwt`) |
| Background jobs | APScheduler (in-process, no Redis/Celery needed) |
| Geocoding | OpenStreetMap Nominatim (free, no API key) |
| Payments | Khalti ePayment (KPG-2) |
| API docs | drf-spectacular (Swagger UI) |

## Modules

| App | Purpose |
|---|---|
| `accounts` | Auth, JWT, role-based user accounts |
| `customers` | Customer profile management |
| `providers` | Provider profiles, verification, availability, geocoding |
| `services` | Service categories and listings |
| `bookings` | Booking requests, state transitions, reminder jobs |
| `payments` | Khalti gateway integration, provider earnings |
| `reviews` | Ratings/reviews tied to completed bookings |
| `notifications` | In-app notifications for booking/payment events |
| `reports` | Customer/provider complaints and disputes |
| `analytics` | Platform-wide stats, daily snapshot job |

## Setup

### 1. Clone and create a virtual environment

```bash
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate   # macOS/Linux
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

Create a `.env` file in this `Backend` folder (same folder as `manage.py`):

```env
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=127.0.0.1,localhost
CORS_ALLOWED_ORIGINS=http://localhost:5173

# Geocoding (OpenStreetMap Nominatim — free, no signup needed)
GEOCODING_USER_AGENT=local-service-marketplace/1.0 (contact: you@example.com)

# Khalti ePayment — sandbox credentials from test-admin.khalti.com
KHALTI_BASE_URL=https://dev.khalti.com/api/v2
KHALTI_SECRET_KEY=your_khalti_sandbox_secret_key
KHALTI_WEBSITE_URL=http://localhost:5173
KHALTI_RETURN_URL=http://localhost:5173/payment/callback
```

> **Getting a Khalti sandbox key:** sign up at
> [test-admin.khalti.com](https://test-admin.khalti.com/#/join/merchant)
> (login OTP: `987654`) and copy your `live_secret_key` from the dashboard
> — despite the name, this is the sandbox key when it comes from
> `test-admin.khalti.com`.

### 4. Run migrations

```bash
python manage.py migrate
```

### 5. Create a superuser (for Django admin access)

```bash
python manage.py createsuperuser
```

### 6. Run the server

```bash
python manage.py runserver
```

On startup you should see a confirmation that background jobs are
registered:

```
✅ APScheduler started — background jobs are running.
   • send_upcoming_booking_reminders — next run at ...
   • generate_daily_analytics_snapshot — next run at ...
```

## API Documentation

Interactive Swagger UI is available at:

```
http://127.0.0.1:8000/api/docs/
```

## Background Jobs

Two scheduled jobs run automatically inside the Django process
whenever `runserver` is active — no separate worker process or
external service required:

- **Booking reminders** — every 5 minutes, checks for accepted bookings
  starting within the hour and notifies both parties
- **Daily analytics snapshot** — once a day at 23:55, saves a row of
  platform-wide stats (users, bookings, revenue, etc.) for historical
  tracking

> This uses APScheduler rather than Celery/Redis to keep local setup
> simple — no additional infrastructure to install. See
> `config/scheduler.py` and `bookings/apps.py` for implementation
> details.

## Payments

Payments go through Khalti's real sandbox ePayment API (not mocked).
Server-side flow:

1. `POST /api/payments/<id>/initiate/` — creates a real Khalti
   transaction, returns a `payment_url` to redirect the customer to
2. Customer pays on Khalti's hosted checkout page
3. `POST /api/payments/<id>/verify/` — calls Khalti's lookup API
   server-side to confirm the real payment status (Khalti has no
   webhook for this flow, so this call is the only source of truth —
   client-supplied status is never trusted)

**Testing with Khalti's sandbox:** use one of their test Khalti IDs
(`9800000000`–`9800000005`), MPIN `1111`, OTP `987654`. Note that
E-Banking/card payment methods are not supported in Khalti's sandbox —
use "Khalti Wallet" for testing.

## Known Limitations / Future Work

- Only Khalti is integrated; eSewa (mentioned in the original proposal)
  is not yet implemented
- No frontend yet — this is backend-only at this stage
- Background jobs run in-process via APScheduler, which is suitable for
  a single-server demo deployment; a production deployment behind
  Gunicorn/multiple workers would need this revisited (e.g. moving to
  Celery + Redis, or ensuring only one worker runs the scheduler)
