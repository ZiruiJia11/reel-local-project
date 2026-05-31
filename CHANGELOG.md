# Changelog

All notable changes to this project will be documented in this file.

---

## 2026-05-31

### Added

- Added PostgreSQL database using Prisma Postgres.
- Added Prisma ORM to the backend.
- Added initial Prisma schema.
- Added Tenant, User, Movie, and Booking models.
- Added UserRole and BookingStatus enums.
- Created and applied the initial database migration.
- Added database seed script.
- Seeded demo tenant and initial movie data.
- Verified database data using Prisma Studio.

### Changed

- Prepared the backend for database-backed movie data.
- Prepared the database schema for future multi-tenant SaaS architecture.

### Next

- Replace static backend movie data with Prisma database queries.
- Refactor backend into routes, controllers, and services.
- Add database-backed booking API.

---

## 2026-05-30

### Added

- Initialized Express backend using Node.js and TypeScript.
- Added health check endpoint.
- Added Movies API endpoint.
- Connected React frontend to backend Movies API.
- Deployed backend to Render.
- Deployed frontend to Vercel.
- Added Vercel rewrite configuration for React Router.

---

## 2026-05-28

### Added

- Initialized React + TypeScript frontend using Vite.
- Added React Router navigation.
- Added shared Layout component.
- Added Navbar component.
- Added Home page.
- Added Movies page.
- Added Movie Details page.
- Added Login page.
- Added Profile page.
- Added Schedule page.
- Added localStorage-based booking flow.
- Added localStorage-based temporary authentication.
- Added protected routes.
- Added conditional UI for logged-in users.
- Split major CSS into component/page-level files.