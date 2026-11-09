# WorkLanka - Sri Lanka Career & Recruitment Platform

> **Full-Stack Job Portal & ATS built with Next.js 14 (App Router), TypeScript (Strict), PostgreSQL, Prisma ORM, Auth.js v5, and Tailwind CSS.**

---

## 1. Quick Start (Setup in under 10 minutes)

### Prerequisites
- **Node.js**: v18.18.0+ or v20+ (tested on Node v24)
- **pnpm**: v9+ / v12+
- **Database**: PostgreSQL 16+ or Supabase Cloud PostgreSQL (active connection configured in `.env`)

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
   *(Pre-configured with cloud database connection & dev credentials)*

3. **Initialize Database Schema & Run Migrations**
   ```bash
   pnpm db:generate
   pnpm db:push
   ```

4. **Seed Initial Sri Lanka Geography, Sectors, Skills & Dev Accounts**
   ```bash
   pnpm db:seed
   ```

5. **Run the Development Server**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 2. Default Seeded Dev Accounts

> [!NOTE]
> All pre-seeded accounts share the development password below.
> **Development Password**: `WorkLankaDev#2026!`

| Role | Email | Password | Access Level & Landing Page |
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

## 3. Platform Architecture & Routes

### Public Job Board
- `/` - WorkLanka Homepage with Hero search, Sri Lankan province/sector cards, and featured vacancies.
- `/jobs` - Advanced Job Search with keyword, sector, district, salary, and job type filters.
- `/jobs/[slug]` - Comprehensive job detail view with Google Jobs JSON-LD structured data and Quick Apply modal.
- `/companies/[slug]` - Public company profile page with active job openings, company mission, values, and stats.

### Candidate Portal
- `/candidate` - Candidate overview dashboard (application metrics, profile strength, recent activity).
- `/candidate/profile` - Profile builder (headline, summary, district, salary expectations, experience).
- `/candidate/applications` - Application tracking center with status indicators and employer feedback notes.
- `/candidate/saved` - Bookmarked vacancies with quick one-click un-save / apply actions.

### Employer Portal & ATS (Applicant Tracking System)
- `/employer` - Employer dashboard with vacancy metrics, candidate pipeline stats, and active postings.
- `/employer/jobs` - Vacancy management table (Active, Review, Drafts, Closed) with quick status actions.
- `/employer/jobs/new` - Step-by-step job posting wizard with multi-channel application routing and screening questions.
- `/employer/jobs/[id]/applications` - Full ATS Kanban Pipeline (`NEW` → `SHORTLISTED` → `INTERVIEW` → `OFFERED` → `HIRED` / `REJECTED`) with resume download, screening answers, and private recruiter notes.
- `/employer/profile` - Company branding, office location, about, mission, vision, and core values.

### Storage Subsystem
- `/api/upload` - Secure multipart file upload endpoint (CV/Resume PDFs, logo images) with MIME & size validation.
- `/api/files/[id]` - Secure file streaming endpoint with strict RBAC access control for candidate CVs.

---

## 4. Available NPM / PNPM Scripts

| Script | Purpose |
| :--- | :--- |
| `pnpm dev` | Starts Next.js development server at port 3000 |
| `pnpm build` | Compiles production Next.js build |
| `pnpm start` | Runs compiled production build |
| `pnpm lint` | Runs Next.js ESLint rules (0 errors, 0 warnings) |
| `pnpm typecheck` | Validates TypeScript in strict mode (`tsc --noEmit`) |
| `pnpm test` | Runs Vitest unit & integration test suite (37 tests) |
| `pnpm test:e2e` | Runs Playwright end-to-end browser tests |
| `pnpm db:generate`| Generates Prisma Client types |
| `pnpm db:push` | Synchronizes Prisma schema directly with database |
| `pnpm db:migrate` | Runs Prisma database migrations |
| `pnpm db:seed` | Runs idempotent seed data script |
| `pnpm db:reset` | Resets database schema and re-runs seed |

---

## 5. Test Verification Status

- **Unit & Integration Tests**: 37 / 37 passed (`pnpm test`):
  - ATS Pipeline state machine & stage progressions (`tests/unit/ats-pipeline.test.ts`)
  - Job search filters & salary calculation (`tests/unit/job-filters.test.ts`)
  - Password policy & entropy checks (`tests/unit/password-policy.test.ts`)
  - Central RBAC permissions & role guards (`tests/unit/rbac.test.ts`)
  - 6-digit OTP code hashing, expiry & attempts (`tests/unit/email-verification.test.ts`)
  - Brute-force lockout & exponential backoff (`tests/unit/lockout.test.ts`)
- **TypeScript Strict Mode**: 0 errors (`pnpm typecheck`)
- **ESLint**: 0 warnings or errors (`pnpm lint`)
- **Next.js Production Build**: 20/20 static & dynamic routes compiled (`pnpm build`)
