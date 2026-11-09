import { PrismaClient } from "@prisma/client";
import { SRI_LANKA_LOCATIONS } from "./data/locations";
import { SECTORS_DATA } from "./data/sectors";
import { SKILLS_DATA } from "./data/skills";
import { JOB_TITLES_DATA } from "./data/titles";
import { seedUsers, DEV_PASSWORD } from "./seed-auth";
import { seedJobsAndApplications } from "./seed-jobs";

const prisma = new PrismaClient();

async function main() {
  console.log("=================================================");
  console.log("WorkLanka Database Seeder - Phase 1");
  console.log("=================================================");

  // 1. Seed Provinces and Districts
  console.log("\n1. Seeding 9 Provinces and 25 Districts of Sri Lanka...");
  for (const provData of SRI_LANKA_LOCATIONS) {
    const province = await prisma.province.upsert({
      where: { code: provData.code },
      update: { name: provData.name },
      create: {
        name: provData.name,
        code: provData.code,
      },
    });

    for (const distData of provData.districts) {
      await prisma.district.upsert({
        where: { code: distData.code },
        update: {
          name: distData.name,
          provinceId: province.id,
        },
        create: {
          name: distData.name,
          code: distData.code,
          provinceId: province.id,
        },
      });
    }
  }
  console.log("✓ Provinces and Districts seeded successfully.");

  // 2. Seed Clean Deduplicated Sectors & Subcategories
  console.log("\n2. Seeding 35 Standardized Sectors & Categories...");
  for (const s of SECTORS_DATA) {
    const sector = await prisma.sector.upsert({
      where: { slug: s.slug },
      update: {
        name: s.name,
        sortOrder: s.sortOrder,
      },
      create: {
        name: s.name,
        slug: s.slug,
        sortOrder: s.sortOrder,
        isActive: true,
      },
    });

    if (s.categories && s.categories.length > 0) {
      for (const cat of s.categories) {
        await prisma.category.upsert({
          where: {
            sectorId_slug: {
              sectorId: sector.id,
              slug: cat.slug,
            },
          },
          update: { name: cat.name },
          create: {
            name: cat.name,
            slug: cat.slug,
            sectorId: sector.id,
          },
        });
      }
    }
  }
  console.log("✓ Sectors and Categories seeded successfully.");

  // 3. Seed Skills (~150)
  console.log("\n3. Seeding standard skills repository...");
  for (const skillName of SKILLS_DATA) {
    const slug = skillName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    await prisma.skill.upsert({
      where: { slug },
      update: { name: skillName },
      create: {
        name: skillName,
        slug,
      },
    });
  }
  console.log(`✓ ${SKILLS_DATA.length} Skills seeded successfully.`);

  // 4. Seed Job Titles (~200)
  console.log("\n4. Seeding Sri Lanka-relevant job titles...");
  for (const title of JOB_TITLES_DATA) {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    await prisma.jobTitle.upsert({
      where: { slug },
      update: { name: title },
      create: {
        name: title,
        slug,
      },
    });
  }
  console.log(`✓ ${JOB_TITLES_DATA.length} Job Titles seeded successfully.`);

  // 5. Seed Users & Profiles (Blocked in Production)
  if (process.env.NODE_ENV === "production") {
    console.log("\n⚠️ SKIPPING DEMO USERS: NODE_ENV is set to 'production'.");
  } else {
    console.log("\n5. Seeding Demo Users & Profiles...");
    await seedUsers(prisma);
    console.log("✓ Demo Users seeded successfully.");

    // 6. Seed Sample Jobs & Applications
    console.log("\n6. Seeding 20 Jobs & Sample Applications...");
    await seedJobsAndApplications(prisma);
    console.log("✓ Sample Jobs seeded successfully.");
  }

  // 7. Seed Pricing Packages
  console.log("\n7. Seeding Promotion Packages...");
  const PACKAGES = [
    { name: "Standard Listing", slug: "standard-free", priceLkr: 0, durationDays: 30, jobPostLimit: 5, featuredJobLimit: 0 },
    { name: "Featured Vacancy (30 Days)", slug: "featured-30-days", priceLkr: 15000, durationDays: 30, jobPostLimit: 1, featuredJobLimit: 1 },
    { name: "Enterprise Pro Pack", slug: "enterprise-pro", priceLkr: 45000, durationDays: 90, jobPostLimit: 10, featuredJobLimit: 5 },
  ];
  for (const pkg of PACKAGES) {
    await prisma.package.upsert({
      where: { slug: pkg.slug },
      update: { name: pkg.name, priceLkr: pkg.priceLkr, durationDays: pkg.durationDays, jobPostLimit: pkg.jobPostLimit, featuredJobLimit: pkg.featuredJobLimit },
      create: pkg,
    });
  }
  console.log("✓ Promotion packages seeded successfully.");

  console.log("\n=================================================");
  console.log("Database Seeding Completed Successfully! 🎉");
  console.log("=================================================");
  console.log("Dev accounts available (Password: " + DEV_PASSWORD + "):");
  console.log("  • Super Admin: admin@worklanka.lk");
  console.log("  • Moderator:   moderator@worklanka.lk");
  console.log("  • Employers:   recruiter@virtusa-sl.lk, careers@combank-sl.lk, hr@mas-holdings.lk");
  console.log("  • Candidates:  nimal@example.com, praveen@example.com, anusha@example.com");
  console.log("=================================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

