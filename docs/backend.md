# ⚙️ Alpine Ace - Backend Documentation

This document provides a basic overview of the **Alpine Ace Backend REST API** (`alpineace--backend`), including the architecture, core modules, database models, background automation, and environment configuration.

---

## 🚀 Technology Stack Overview

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Runtime & Language** | **Node.js (v20+ / v22+) & TypeScript** | Strict type safety, modern async/await, and compilation to clean CommonJS. |
| **Web Framework** | **Express.js** | Fast, minimalist HTTP server handling routing, middleware, and request dispatching. |
| **Database & ORM** | **MySQL with TypeORM** | Relational database mapping using typed entities, repositories, and data source management. |
| **API Specification** | **TSOA (TypeScript OpenAPI)** | Automatic OpenAPI / Swagger generation and request routing directly from TypeScript controllers and DTOs. |
| **Dependency Injection** | **TSyringe** | Lightweight DI container decoupling controllers, services, and repositories. |
| **Object Storage** | **Cloudflare R2 (S3 API)** | Cloud-native, zero-egress media storage for images and package assets via `@aws-sdk/client-s3`. |
| **Email Service** | **Nodemailer + EJS** | Transactional booking confirmations and inquiry alerts with responsive HTML email templates. |
| **Job Scheduling** | **Node-Cron** | Automated background tasks for database backups and temporary media cleanup. |
| **Security & Logging** | **Helmet, CORS, Winston, Rate-Limit** | Standard web security headers, IP rate limiting, access logs, and global error handling. |

---

## 🏛️ Application Architecture

The backend follows a clean, decoupled **Layered Architecture**:

```text
HTTP Request
     │
     ▼
[ Middlewares ] ────────► (Helmet, CORS, Request Context, Rate Limiters, HttpLogger)
     │
     ▼
[ Controllers ] ────────► (TSOA TypeScript Controllers defining routes and validation)
     │
     ▼
[ Services ] ───────────► (Core business logic, email triggers, price computations)
     │
     ▼
[ TypeORM Entities ] ───► (MySQL Database Models & Repositories)
     │
     ▼
MySQL Database (cPanel)
```

---

## 📦 Core Modules & Entities

1. **Authentication & Admin (`admin/`)**:
   - Secure login with bcrypt password comparison.
   - JWT token generation and cookie handling.
   - Failed login tracking and brute-force lockout protection.
2. **Packages & Content (`trek/`, `tour/`, `expedition/`)**:
   - Itinerary breakdown, highlights, inclusions/exclusions, packing recommendations.
   - Dynamic tier pricing (solo, pair, small group, large group discounts).
3. **Bookings & Inquiries (`booking/`, `inquiry/`)**:
   - Customer booking reservations, passenger details, and custom package add-ons.
   - Automated email notifications to both the customer and the admin.
4. **Taxonomies (`category/`, `activity/`)**:
   - Categorization by geographic region (Everest, Annapurna, etc.) with custom ordering index.
   - Adventure styles (Trekking, Peak Climbing, Cultural Tours).
5. **Media Management (`media/`)**:
   - Cloudflare R2 file uploads with image optimization and public CDN URLs.
6. **Blog Engine (`blog/`)**:
   - Rich-text markdown and HTML storage with SEO slug generation.
7. **System & Compliance (`setting/`, `log/`, `notification/`)**:
   - Dynamic Terms & Conditions and Privacy Policy storage.
   - Security audit trails logging every administrative update and login IP.

---

## ⏰ Automated Background Crons

The backend runs two automated cron jobs to maintain database health and storage cleanliness:

1. **Daily Database Backup (`src/crons/dbBackup.cron.ts`)**:
   - Dumps the MySQL database and securely streams encrypted backups directly to the Cloudflare R2 backup bucket (`alpineace-db-backups`).
2. **Temporary Media Cleanup (`src/crons/removeTempMedia.cron.ts`)**:
   - Cleans up orphan images uploaded during draft editing that were never attached to a published package or blog post.

---

## ⚙️ Environment Variables Reference (`.env`)

```bash
# Application Port & Mode
PORT=5001
NODE_ENV=PRODUCTION

# Database Connection (Standard cPanel MySQL connection string)
DATABASE_URL=mysql://cpaneluser_dbuser:StrongPassword@localhost:3306/cpaneluser_alpineace
DB_SSL=false

# JWT Secret Token
JWT_SECRET=your_super_secret_jwt_random_string_here

# Mail Server (SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USER=info@alpineacetreks.com
MAIL_PASSWORD=your_email_app_password
ADMIN_EMAIL=info@alpineacetreks.com

# URL Whitelists & Public Domains
FRONTEND_BASE_URL=https://www.alpineacetreks.com
BASE_URL=https://api.alpineacetreks.com
PUBLIC_URL=https://media.alpineacetreks.com

# Logging
LOG_LEVEL=info

# Cloudflare R2 Object Storage
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=alpineace-media
R2_BACKUP_BUCKET_NAME=alpineace-db-backups
R2_PUBLIC_DOMAIN=https://media.alpineacetreks.com

# Cloudflare Turnstile Verification
TURNSTILE_SECRET_KEY=your_cloudflare_turnstile_secret_key
TURNSTILE_ENABLED=true
```

---

## 💻 Standard Development & Build Commands

```bash
# Install dependencies
npm install

# Start in development mode (with TSOA route generation & auto-reload)
npm run dev

# Compile TypeScript to production JavaScript (dist/ folder)
npm run build

# Start production server locally or on server
npm run start

# Seed default Super Admin user
npm run seed:admin
```
