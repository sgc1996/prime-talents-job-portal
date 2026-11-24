/**
 * Site & Brand Configuration for Prime Hire
 * Single source of truth for branding, metadata, contact info, and role routing.
 */
export const siteConfig = {
  name: "Prime Hire",
  tagline: "Sri Lanka's Next-Generation Career & Recruitment Platform",
  description:
    "Connecting Sri Lankan talent with top employers across all 9 provinces and 25 districts.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  supportEmail: "info@primetalentssolutions.lk",
  logo: "/images/logo.png",
  favicon: "/favicon.ico",
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

