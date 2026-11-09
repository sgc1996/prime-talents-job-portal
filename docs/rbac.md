# WorkLanka - Role-Based Access Control (RBAC) Specification

## 1. Overview
WorkLanka implements a dual-layer Role-Based Access Control (RBAC) architecture:
1. **Edge Route Layer (`middleware.ts`)**: Fast perimeter defense preventing unauthorized requests from rendering protected server pages.
2. **Server Action & API Boundary (`lib/rbac/`)**: Deep validation inside server actions, route handlers, and database queries. Never relies on client-provided assertions.

---

## 2. Platform Roles
The system recognizes four distinct user roles (`UserRole`):

| Role | Target Persona | Self-Assignable? | Base Dashboard Route |
| :--- | :--- | :--- | :--- |
| **`SUPER_ADMIN`** | System owner / Lead administrators | **No** (database / admin grant only) | `/admin` |
| **`MODERATOR`** | Content and dispute moderators | **No** (promoted by `SUPER_ADMIN`) | `/admin` |
| **`EMPLOYER`** | Companies, HR managers, and recruiters | **Yes** (via registration) | `/employer` |
| **`CANDIDATE`** | Job seekers in Sri Lanka | **Yes** (via registration) | `/candidate` |

---

## 3. RBAC Permission Matrix

| Permission Key | Description | SUPER_ADMIN | MODERATOR | EMPLOYER | CANDIDATE |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `user:create` | Provision new users manually | ✅ | ❌ | ❌ | ❌ |
| `user:read` | View user profiles and accounts | ✅ | ✅ | ❌ | ❌ |
| `user:update` | Edit user credentials and details | ✅ | ❌ | ❌ | ❌ |
| `user:delete` | Soft-delete user accounts | ✅ | ❌ | ❌ | ❌ |
| `user:change_role` | Promote/demote user roles | ✅ | ❌ | ❌ | ❌ |
| `user:suspend` | Suspend or activate user accounts | ✅ | ❌ | ❌ | ❌ |
| `settings:manage` | Modify global site settings & config | ✅ | ❌ | ❌ | ❌ |
| `audit_log:read` | Inspect administrative audit trails | ✅ | ✅ | ❌ | ❌ |
| `moderation:jobs` | Approve, reject, or archive jobs | ✅ | ✅ | ❌ | ❌ |
| `moderation:reviews` | Approve or reject employer reviews | ✅ | ✅ | ❌ | ❌ |
| `moderation:reports` | Resolve flag/dispute reports | ✅ | ✅ | ❌ | ❌ |
| `employer:profile_manage`| Manage company profile details | ✅ | ❌ | ✅ (Own) | ❌ |
| `job:create` | Post new job openings | ✅ | ❌ | ✅ | ❌ |
| `job:update_own` | Modify own company jobs | ✅ | ❌ | ✅ (Own) | ❌ |
| `job:delete_own` | Delete / close own company jobs | ✅ | ❌ | ✅ (Own) | ❌ |
| `application:review` | Shortlist, reject, or hire applicants | ✅ | ❌ | ✅ (Own) | ❌ |
| `employer:member_manage`| Manage employer team members | ✅ | ❌ | ✅ (Owner) | ❌ |
| `candidate:profile_manage`| Update resume, summary, skills | ✅ | ❌ | ❌ | ✅ (Own) |
| `application:submit` | Apply for open job vacancies | ✅ | ❌ | ❌ | ✅ |
| `job:save` | Bookmark jobs to saved list | ✅ | ❌ | ❌ | ✅ |
| `job_alert:manage` | Configure search and email alerts | ✅ | ❌ | ❌ | ✅ |

> [!IMPORTANT]
> **Moderator Separation of Duties**:
> Moderators have complete authority to review and moderate content (`moderation:jobs`, `moderation:reviews`, `moderation:reports`), but are **strictly blocked** from managing users (`user:create`, `user:delete`, `user:change_role`, `user:suspend`) and system settings (`settings:manage`).

---

## 4. Route Protection Matrix

| Route Pattern | Required Role(s) | Unauthenticated Behavior | Unauthorized Behavior |
| :--- | :--- | :--- | :--- |
| `/candidate/*` | `CANDIDATE`, `SUPER_ADMIN` | Redirect to `/login?callbackUrl=...` | Redirect to `/` |
| `/employer/*` | `EMPLOYER`, `SUPER_ADMIN` | Redirect to `/login?callbackUrl=...` | Redirect to `/` |
| `/admin/*` | `SUPER_ADMIN`, `MODERATOR` | Redirect to `/login?callbackUrl=...` | Redirect to `/` |
| `/login`, `/register` | Public (Unauthenticated) | Allowed | Redirect to user role dashboard |

---

## 5. Audit Logging Requirements
Append-only audit records are written to `AuditLog` in PostgreSQL for:
1. Every login by an administrative role (`SUPER_ADMIN` or `MODERATOR`).
2. User role promotion / demotion.
3. User suspension / reactivation.
4. Password resets and password changes.

