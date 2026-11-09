export interface SeedSector {
  name: string;
  slug: string;
  sortOrder: number;
  categories?: { name: string; slug: string }[];
}

export const SECTORS_DATA: SeedSector[] = [
  {
    name: "Information Technology (Software)",
    slug: "it-software",
    sortOrder: 1,
    categories: [
      { name: "Frontend Development", slug: "frontend-development" },
      { name: "Backend Development", slug: "backend-development" },
      { name: "Full Stack Development", slug: "full-stack-development" },
      { name: "Mobile App Development", slug: "mobile-app-development" },
      { name: "DevOps & Cloud Engineering", slug: "devops-cloud-engineering" },
      { name: "QA & Software Testing", slug: "qa-software-testing" },
    ],
  },
  {
    name: "Banking & Finance",
    slug: "banking-finance",
    sortOrder: 2,
    categories: [
      { name: "Retail Banking", slug: "retail-banking" },
      { name: "Corporate Banking", slug: "corporate-banking" },
      { name: "Credit & Risk Management", slug: "credit-risk-management" },
      { name: "Financial Analysis", slug: "financial-analysis" },
      { name: "Wealth Management", slug: "wealth-management" },
    ],
  },
  {
    name: "Accounting & Auditing",
    slug: "accounting-auditing",
    sortOrder: 3,
    categories: [
      { name: "Taxation", slug: "taxation" },
      { name: "Statutory Auditing", slug: "statutory-auditing" },
      { name: "Management Accounting", slug: "management-accounting" },
      { name: "Bookkeeping", slug: "bookkeeping" },
    ],
  },
  {
    name: "Apparel & Garments",
    slug: "apparel-garments",
    sortOrder: 4,
    categories: [
      { name: "Merchandising", slug: "merchandising" },
      { name: "Pattern Making & Sampling", slug: "pattern-making-sampling" },
      { name: "Quality Assurance (Garments)", slug: "qa-garments" },
      { name: "Production Management", slug: "production-management" },
      { name: "Fashion & Textile Design", slug: "fashion-textile-design" },
    ],
  },
  {
    name: "Hospitality & Tourism",
    slug: "hospitality-tourism",
    sortOrder: 5,
    categories: [
      { name: "Front Office & Reservations", slug: "front-office-reservations" },
      { name: "Food & Beverage Service", slug: "fb-service" },
      { name: "Culinary & Kitchen", slug: "culinary-kitchen" },
      { name: "Tour Operations & Travel Guides", slug: "tour-operations" },
      { name: "Housekeeping", slug: "housekeeping" },
    ],
  },
  {
    name: "Logistics, Shipping & Supply Chain",
    slug: "logistics-supply-chain",
    sortOrder: 6,
    categories: [
      { name: "Freight Forwarding", slug: "freight-forwarding" },
      { name: "Warehouse & Inventory", slug: "warehouse-inventory" },
      { name: "Fleet & Transport Management", slug: "fleet-transport" },
      { name: "Procurement & Sourcing", slug: "procurement-sourcing" },
    ],
  },
  {
    name: "Healthcare & Pharmaceuticals",
    slug: "healthcare-pharmaceuticals",
    sortOrder: 7,
    categories: [
      { name: "Nursing & Patient Care", slug: "nursing-patient-care" },
      { name: "Pharmacy & Dispensing", slug: "pharmacy-dispensing" },
      { name: "Medical Laboratory Technology", slug: "medical-laboratory" },
      { name: "Medical Sales & Marketing", slug: "medical-sales" },
    ],
  },
  {
    name: "Sales & Business Development",
    slug: "sales-business-development",
    sortOrder: 8,
    categories: [
      { name: "Direct Sales & Field Sales", slug: "direct-sales" },
      { name: "Key Account Management", slug: "key-account-management" },
      { name: "B2B Business Development", slug: "b2b-bizdev" },
      { name: "Telemarketing & Inside Sales", slug: "inside-sales" },
    ],
  },
  { name: "Administration & Secretarial", slug: "administration-secretarial", sortOrder: 9 },
  { name: "Agriculture", slug: "agriculture", sortOrder: 10 },
  { name: "Automotive", slug: "automotive", sortOrder: 11 },
  { name: "BPO / KPO / Call Centres", slug: "bpo-kpo-call-centres", sortOrder: 12 },
  { name: "Construction & Real Estate", slug: "construction-real-estate", sortOrder: 13 },
  { name: "Consultancy", slug: "consultancy", sortOrder: 14 },
  { name: "Customer Service", slug: "customer-service", sortOrder: 15 },
  { name: "Design & Creative", slug: "design-creative", sortOrder: 16 },
  { name: "Education & Training", slug: "education-training", sortOrder: 17 },
  { name: "Energy & Utilities", slug: "energy-utilities", sortOrder: 18 },
  { name: "Engineering", slug: "engineering", sortOrder: 19 },
  { name: "Environment & Sustainability", slug: "environment-sustainability", sortOrder: 20 },
  { name: "Fast Moving Consumer Goods (FMCG)", slug: "fmcg", sortOrder: 21 },
  { name: "Food & Beverage", slug: "food-beverage", sortOrder: 22 },
  { name: "Government & Public Administration", slug: "government-public-admin", sortOrder: 23 },
  { name: "Human Resources & Recruitment", slug: "hr-recruitment", sortOrder: 24 },
  { name: "Information Technology (Hardware & Networks)", slug: "it-hardware-networks", sortOrder: 25 },
  { name: "Insurance", slug: "insurance", sortOrder: 26 },
  { name: "Legal", slug: "legal", sortOrder: 27 },
  { name: "Manufacturing & Production", slug: "manufacturing-production", sortOrder: 28 },
  { name: "Marketing & Advertising", slug: "marketing-advertising", sortOrder: 29 },
  { name: "Media & Communications", slug: "media-communications", sortOrder: 30 },
  { name: "NGO & Non-Profit", slug: "ngo-non-profit", sortOrder: 31 },
  { name: "Quality, Health & Safety", slug: "quality-health-safety", sortOrder: 32 },
  { name: "Retail", slug: "retail", sortOrder: 33 },
  { name: "Security Services", slug: "security-services", sortOrder: 34 },
  { name: "Telecommunications", slug: "telecommunications", sortOrder: 35 },
  { name: "Trade & Commerce", slug: "trade-commerce", sortOrder: 36 },
];

