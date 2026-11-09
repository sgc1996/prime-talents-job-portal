# WorkLanka - Sri Lanka Career & Recruitment Platform

> **Phase 1: Foundation, Database Architecture, Authentication, RBAC, and Seed Data.**

---

## 1. Quick Start (Setup in under 10 minutes)

### Prerequisites
- **Node.js**: v18.18.0+ or v20+ (tested on Node v24)
- **pnpm**: v9+ / v12+
- **Docker & Docker Compose**: for local PostgreSQL 16 and Mailpit

---

### Step-by-Step Setup

1. **Clone & Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   ```
   *(Defaults are pre-configured for local Docker development)*

3. **Start Local PostgreSQL & Mailpit (SMTP)**
   ```bash
   docker compose up -d
   ```
   - **PostgreSQL 16**: `localhost:5432` (db: `worklanka_db`, user: `worklanka_user`)
   - **Mailpit SMTP**: `localhost:1025`
   - **Mailpit Web UI**: [http://localhost:8025](http://localhost:8025) *(view outgoing emails & 6-digit codes)*

4. **Initialize Database Schema & Run Migrations**
   ```bash
   pnpm db:generate
   pnpm db:push
   # Or for migration tracking:
   # pnpm db:migrate
   ```

5. **Seed Initial Sri Lanka Geography, Sectors, Skills & Dev Accounts**
   ```bash
   pnpm db:seed
   ```

6. **Run the Development Server**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 2. Default Seeded Dev Accounts

> [!NOTE]
> All pre-seeded accounts share the development password below.
> **Development Password**: `WorkLankaDev#2026!`

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@worklanka.lk` | `WorkLankaDev#2026!` | Full administrative access to `/admin` |
| **Moderator** | `moderator@worklanka.lk` | `WorkLankaDev#2026!` | Content moderation access to `/admin` (User management blocked) |
| **Employer 1** | `recruiter@virtusa-sl.lk` | `WorkLankaDev#2026!` | Virtusa Sri Lanka (IT sector) owner on `/employer` |
| **Employer 2** | `careers@combank-sl.lk` | `WorkLankaDev#2026!` | Commercial Bank of Ceylon owner on `/employer` |
| **Employer 3** | `hr@mas-holdings.lk` | `WorkLankaDev#2026!` | MAS Holdings owner on `/employer` |
| **Candidate 1**| `nimal@example.com` | `WorkLankaDev#2026!` | Job seeker profile on `/candidate` |
| **Candidate 2**| `praveen@example.com` | `WorkLankaDev#2026!` | Job seeker profile on `/candidate` |
| **Candidate 3**| `anusha@example.com` | `WorkLankaDev#2026!` | Job seeker profile on `/candidate` |

---

## 3. Available NPM / PNPM Scripts

| Script | Purpose |
| :--- | :--- |
| `pnpm dev` | Starts Next.js development server at port 3000 |
| `pnpm build` | Compiles production Next.js build |
| `pnpm start` | Runs compiled production build |
| `pnpm lint` | Runs Next.js ESLint rules |
| `pnpm typecheck` | Validates TypeScript in strict mode (`tsc --noEmit`) |
| `pnpm test` | Runs Vitest unit & integration test suite |
| `pnpm test:e2e` | Runs Playwright end-to-end browser tests |
| `pnpm db:generate`| Generates Prisma Client types |
| `pnpm db:push` | Synchronizes Prisma schema directly with database |
| `pnpm db:migrate` | Runs Prisma database migrations |
| `pnpm db:seed` | Runs idempotent seed data script |
| `pnpm db:reset` | Resets database schema and re-runs seed |

---

## 4. What Was Verified in Phase 1

1. **Authentication Flows**:
   - Candidate signup: creates `User` + `CandidateProfile` stub with status `PENDING_VERIFICATION`.
   - Employer signup: creates `User` + `EmployerProfile` stub + `EmployerMember` (Owner).
   - 6-digit email OTP generation, SHA-256 hashing, 15-minute expiry, max 5 attempt limit, and 60-second cooldown.
   - Magic link alternative authentication.
   - Login with email/password; unverified accounts redirected to email verification.
   - Password reset flow with single-use expiring token.
   - Session invalidation upon password change.

2. **Brute-Force & Security Baseline**:
   - In-memory sliding-window rate limiting per IP and per account.
   - Incremental account lockout: 5 attempts = 15 mins, 8 attempts = 1 hour, 10+ attempts = 24 hours.
   - Strict password policy: min 10 characters, mixed case, numbers, symbols, and blacklist check.
   - Generic error messages to prevent email enumeration.
   - Cloudflare Turnstile / hCaptcha abstraction adapter.
   - HTTP Security headers: CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy.

3. **Role-Based Access Control (RBAC)**:
   - Central matrix in `lib/rbac/` evaluating `can(user, permission, resource)`.
   - Guarded routes: `/candidate/*`, `/employer/*`, `/admin/*`.
   - Strict separation of duties: Moderators have full moderation rights, but are forbidden from managing users or modifying system settings.
   - Append-only `AuditLog` entries for admin logins, role changes, user suspension, and password resets.

4. **Taxonomy & Seed Data**:
   - All 9 provinces and 25 districts of Sri Lanka.
   - 35 clean, deduplicated sectors + subcategories under 8 primary sectors.
   - ~150 standardized skills and ~200 Sri Lanka-relevant job titles.
   - 20 jobs with mixed statuses (`APPROVED`, `PENDING_REVIEW`, `REJECTED`, `EXPIRED`).

---

## 5. What You Must Configure

Before deploying to production, configure the following in your environment:
1. `DATABASE_URL`: Your managed PostgreSQL 16 connection string (e.g., Supabase, Neon, AWS RDS).
2. `AUTH_SECRET`: Generate a cryptographically strong secret with `openssl rand -base64 33`.
3. `NEXT_PUBLIC_APP_URL`: Set your production URL (e.g., `https://worklanka.lk`).
4. `EMAIL_PROVIDER`: Change from `nodemailer` to `resend`.
5. `RESEND_API_KEY`: Set your production Resend API key.
6. `CAPTCHA_ENABLED`: Set to `true` and configure `CAPTCHA_SITE_KEY` and `CAPTCHA_SECRET_KEY` (Cloudflare Turnstile).
7. `GOOGLE_OAUTH_ENABLED`: Set to `true` and configure `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` if social sign-in is required.

---

## 6. Known Limitations & Phase 2 Roadmap
- **No Public Portal Pages Yet**: Only placeholder dashboards `/candidate`, `/employer`, and `/admin` are rendered in Phase 1 to verify RBAC guards.
- **File Upload Storage**: File records are managed via `StoredFile` database schema. S3/R2 direct cloud upload adapter will be implemented in Phase 2 for resumes and logos.
- **Two-Factor Authentication (2FA)**: The `User.twoFactorSecret` field is present in the schema; TOTP authenticator app integration is scheduled for admin hardening in Phase 3.
