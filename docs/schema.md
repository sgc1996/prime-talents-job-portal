# WorkLanka - Data Dictionary & Schema Documentation

The platform uses PostgreSQL 16 managed via Prisma ORM. All entities use CUID primary keys, automatic `createdAt` / `updatedAt` timestamps, and foreign key constraints.

---

## 1. Authentication & Identity Models

### `User`
The central user account table supporting both Credentials and OAuth sign-in.
- `id`: CUID unique identifier.
- `email`: Normalized lowercase unique email address.
- `emailVerifiedAt`: Timestamp when email was confirmed.
- `passwordHash`: Bcrypt/Argon2 salted hash (nullable for OAuth accounts).
- `name`: Display name.
- `phone`: Contact telephone number.
- `role`: Enum (`SUPER_ADMIN`, `MODERATOR`, `EMPLOYER`, `CANDIDATE`).
- `status`: Enum (`ACTIVE`, `SUSPENDED`, `PENDING_VERIFICATION`).
- `lastLoginAt`: Timestamp of last successful authentication.
- `failedLoginCount`: Tracks consecutive failed attempts for brute-force lockout.
- `lockedUntil`: Expiration timestamp of lockout backoff window.
- `twoFactorSecret`: Reserved for admin 2FA in subsequent phases.
- `deletedAt`: Soft-delete timestamp.

### `Account`, `Session`, `VerificationToken`
Standard Auth.js (NextAuth v5) adapter models managing OAuth provider links, session tokens, and CSRF tokens.

### `EmailVerificationCode`
Stores 6-digit numeric verification codes for email confirmation.
- `codeHash`: SHA-256 hash of the 6-digit code.
- `expiresAt`: 15-minute expiration timestamp.
- `attempts`: Counter tracking invalid code entries (max 5 attempts).
- `usedAt`: Invalidation timestamp upon successful verification.

### `PasswordResetToken`
Manages single-use, cryptographically strong tokens for password recovery.
- `tokenHash`: SHA-256 hash of the raw URL token.
- `expiresAt`: 1-hour expiration timestamp.
- `usedAt`: Prevents token reuse.

---

## 2. Profile Models

### `CandidateProfile`
1:1 extension of `User` for job seekers.
- `headline`: Professional headline (e.g., "Senior Software Engineer").
- `summary`: Markdown/text career summary.
- `districtId`: Foreign key to `District` for location matching.
- `expectedSalaryMin` / `expectedSalaryMax`: Desired salary range in LKR.
- `experienceYears`: Years of relevant professional experience.
- `educationLevel`: Highest level of education attained.
- `visibility`: Visibility setting (`PUBLIC`, `EMPLOYERS_ONLY`, `HIDDEN`).
- `openToWork`: Toggle flag for immediate availability.
- `profileCompleteness`: Computed percentage score (0-100%).

### `EmployerProfile`
1:1 extension of `User` for verified hiring organizations.
- `companyName`: Registered legal or trading company name.
- `slug`: URL-friendly unique identifier (e.g., `/company/virtusa-sri-lanka`).
- `logoUrl`, `coverUrl`: Branding image references.
- `about`, `mission`, `vision`, `values`: Detailed company overview.
- `sectorId`: Primary industry sector.
- `companySize`: Enum (`STARTUP_1_10` to `ENTERPRISE_1000_PLUS`).
- `foundedYear`: Year company was established.
- `website`, `socials`: Web and social media links.
- `address`, `districtId`: Physical company location.
- `latitude`, `longitude`: Optional coordinates with range validation; never defaults to arbitrary fallback coordinates.
- `verificationStatus`: Organization status (`UNVERIFIED`, `PENDING`, `VERIFIED`, `REJECTED`).
- `ratingAvg`, `ratingCount`, `followerCount`: Cached review metrics.

### `EmployerMember`
Facilitates multi-user employer team access (Owner vs Recruiter roles).

---

## 3. Taxonomy & Geography Models

### `Province` & `District`
Authoritative 2-tier administrative location hierarchy covering all 9 Provinces and 25 Districts of Sri Lanka.

### `City`
Granular locality table with postal codes linked to `District`.

### `Sector` & `Category`
Hierarchical taxonomy for job and employer classification (35 standardized sectors + curated subcategories).

### `Skill` & `JobTitle`
Standardized repositories of skills and Sri Lanka-relevant job titles used for auto-suggestion and search indexing.

---

## 4. Jobs & Applications

### `Job`
Core vacancy posting with rich metadata, salary disclosure, and moderation statuses.
- `status`: Enum (`DRAFT`, `PENDING_REVIEW`, `APPROVED`, `REJECTED`, `EXPIRED`, `FILLED`, `ARCHIVED`).
- Indexes: `(status, publishedAt DESC)`, `sectorId`, `districtId`, `jobType`, `employerId`.
- Full-text search supported on `title` and `descriptionHtml`.

### `JobSkill`
Many-to-many relationship mapping jobs to required skills.

### `ScreeningQuestion`
Custom employer questions attached to vacancies (text, boolean, or multiple-choice).

### `Application`
Application submissions linking candidate to job. Unique constraint on `(jobId, candidateId)` prevents duplicate applications.

### `StoredFile`
Centralized file registry for CVs, cover letters, and company branding assets.

### `SavedJob`, `FollowedEmployer`, `JobAlert`, `Review`, `Report`
Candidate engagement, company following, automated search alerts, candidate-to-employer reviews, and abuse reporting.

---

## 5. Commerce, Content & Governance

### `Package`, `Order`, `Payment`
Monetization schema supporting job posting tiers, featured credits, and payment gateway webhooks.

### `BlogPost`, `NewsEvent`, `Page`, `Banner`, `EmailTemplate`, `SiteSetting`, `ContactMessage`, `Notification`
Content management and dynamic platform settings.

### `AuditLog`
Append-only governance trail recording the actor, action, before/after JSON states, IP address, and user agent.

