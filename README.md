# Remoof — Modern Bicycle Parts Webshop

Remoof is a full-stack ecommerce experience for precision bicycle components. Built with Next.js 14, Prisma, PostgreSQL, NextAuth, Stripe, and TailwindCSS.

## Features
- User accounts with email verification, login, logout, and password reset flow
- Role-based admin dashboard for managing products, orders, and customers
- Product detail pages with optional 3D previews via `<model-viewer>`
- Shopping cart, Stripe Checkout integration, and webhook-backed order confirmation
- Transactional email notifications for verification, password reset, and order events
- Dark + light themes, responsive layout, legal pages (Terms, Privacy, Refund)

## Getting started
1. Install dependencies
```bash
npm install
```
2. Configure environment
```bash
cp .env.example .env
# edit variables (DATABASE_URL, NEXTAUTH_SECRET, STRIPE keys, SMTP credentials, APP_BASE_URL)
```
3. Setup database
```bash
npx prisma migrate dev
npx prisma db seed
```
4. Run the app
```bash
npm run dev
```

## Tech stack
- Next.js (App Router) + TypeScript
- TailwindCSS for styling
- Prisma + PostgreSQL for persistence
- NextAuth (credentials) for authentication
- Stripe for checkout + webhooks
- Nodemailer for transactional email

## API outline
- `POST /api/auth/signup` — create account & send verification email
- `POST /api/auth/verify` — confirm email token
- `POST /api/auth/reset` — request password reset email
- `POST /api/auth/reset/confirm` — submit new password
- `GET/POST /api/products` — list or create products (admin)
- `GET/PUT/DELETE /api/products/:id` — product detail management
- `POST /api/checkout` — Stripe Checkout session creation
- `POST /api/webhooks/stripe` — payment confirmation to orders
- `GET/POST /api/orders` — list or create orders

## Security notes
- Passwords are hashed with bcrypt
- Inputs validated via Zod schemas
- Admin-only routes check session role
- Stripe webhook signature validated with `STRIPE_WEBHOOK_SECRET`

## Seeding
`prisma/seed.ts` provisions an admin user (`admin@remoof.bike` / `Password123!`), a demo rider, and sample products with images and a 3D model reference.

## Legal language
Terms, Privacy, and Refund policy pages live under `/legal/*` and are linked in the footer. Signup flow requires accepting the Terms of Service.
