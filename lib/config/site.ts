/**
 * Site & Brand Configuration for WorkLanka
 * Single source of truth for branding, metadata, contact info, and role routing.
 */
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "WorkLanka",
  tagline: "Sri Lanka's Next-Generation Career & Recruitment Platform",
  description:
    "Connecting Sri Lankan talent with top employers across all 9 provinces and 25 districts.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@worklanka.lk",
  links: {
    terms: "/terms",
    privacy: "/privacy",
  },
  defaultCurrency: "LKR",
  roles: {
    candidate: {
      label: "Job Seeker",
      dashboardPath: "/candidate",
    },
    employer: {
      label: "Employer",
      dashboardPath: "/employer",
    },
    moderator: {
      label: "Moderator",
      dashboardPath: "/admin",
    },
    superAdmin: {
      label: "Super Admin",
      dashboardPath: "/admin",
    },
  },
} as const;

export type SiteConfig = typeof siteConfig;

