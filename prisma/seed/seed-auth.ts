import { PrismaClient, UserRole, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

export const DEV_PASSWORD = "WorkLankaDev#2026!";

export async function seedUsers(prisma: PrismaClient) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("SECURITY ALERT: Cannot seed demo users in production environment!");
  }

  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 10);

  // Retrieve Colombo district ID
  const colombo = await prisma.district.findUnique({
    where: { code: "COL" },
  });

  // Retrieve Kandy district ID
  const kandy = await prisma.district.findUnique({
    where: { code: "KAN" },
  });

  // Retrieve IT & Software sector
  const itSector = await prisma.sector.findUnique({
    where: { slug: "it-software" },
  });

  // Retrieve Banking sector
  const bankingSector = await prisma.sector.findUnique({
    where: { slug: "banking-finance" },
  });

  // Retrieve Apparel sector
  const apparelSector = await prisma.sector.findUnique({
    where: { slug: "apparel-garments" },
  });

  console.log("Seeding Administrative Users...");

  // 1. SUPER_ADMIN
  await prisma.user.upsert({
    where: { email: "admin@worklanka.lk" },
    update: { passwordHash, status: UserStatus.ACTIVE },
    create: {
      email: "admin@worklanka.lk",
      name: "Super Administrator",
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
  });

  // 2. MODERATOR
  await prisma.user.upsert({
    where: { email: "moderator@worklanka.lk" },
    update: { passwordHash, status: UserStatus.ACTIVE },
    create: {
      email: "moderator@worklanka.lk",
      name: "Chief Content Moderator",
      passwordHash,
      role: UserRole.MODERATOR,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
  });

  console.log("Seeding Employer Users & Company Profiles...");

  // 3. EMPLOYER 1 (IT Company)
  const empUser1 = await prisma.user.upsert({
    where: { email: "recruiter@virtusa-sl.lk" },
    update: { passwordHash, status: UserStatus.ACTIVE },
    create: {
      email: "recruiter@virtusa-sl.lk",
      name: "Kamal Perera (HR Virtusa)",
      passwordHash,
      role: UserRole.EMPLOYER,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
      phone: "0112448899",
    },
  });

  const empProfile1 = await prisma.employerProfile.upsert({
    where: { userId: empUser1.id },
    update: {},
    create: {
      userId: empUser1.id,
      companyName: "Virtusa Sri Lanka",
      slug: "virtusa-sri-lanka",
      about: "Global provider of digital engineering and IT outsourcing services in Colombo.",
      verificationStatus: "VERIFIED",
      sectorId: itSector?.id,
      districtId: colombo?.id,
      address: "No. 752, Dr. Danister De Silva Mawatha, Colombo 09",
      companySize: "ENTERPRISE_1000_PLUS",
      website: "https://www.virtusa.com",
    },
  });

  await prisma.employerMember.upsert({
    where: {
      employerId_userId: {
        employerId: empProfile1.id,
        userId: empUser1.id,
      },
    },
    update: {},
    create: {
      employerId: empProfile1.id,
      userId: empUser1.id,
      memberRole: "OWNER",
    },
  });

  // 4. EMPLOYER 2 (Banking)
  const empUser2 = await prisma.user.upsert({
    where: { email: "careers@combank-sl.lk" },
    update: { passwordHash, status: UserStatus.ACTIVE },
    create: {
      email: "careers@combank-sl.lk",
      name: "Dilini Fernando (Commercial Bank)",
      passwordHash,
      role: UserRole.EMPLOYER,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
      phone: "0112486000",
    },
  });

  const empProfile2 = await prisma.employerProfile.upsert({
    where: { userId: empUser2.id },
    update: {},
    create: {
      userId: empUser2.id,
      companyName: "Commercial Bank of Ceylon",
      slug: "commercial-bank-of-ceylon",
      about: "Leading private commercial bank in Sri Lanka providing premier banking solutions.",
      verificationStatus: "VERIFIED",
      sectorId: bankingSector?.id,
      districtId: colombo?.id,
      address: "Commercial House, No 21, Sir Razik Fareed Mawatha, Colombo 01",
      companySize: "ENTERPRISE_1000_PLUS",
      website: "https://www.combank.lk",
    },
  });

  await prisma.employerMember.upsert({
    where: {
      employerId_userId: {
        employerId: empProfile2.id,
        userId: empUser2.id,
      },
    },
    update: {},
    create: {
      employerId: empProfile2.id,
      userId: empUser2.id,
      memberRole: "OWNER",
    },
  });

  // 5. EMPLOYER 3 (Apparel)
  const empUser3 = await prisma.user.upsert({
    where: { email: "hr@mas-holdings.lk" },
    update: { passwordHash, status: UserStatus.ACTIVE },
    create: {
      email: "hr@mas-holdings.lk",
      name: "Suresh Silva (MAS Holdings)",
      passwordHash,
      role: UserRole.EMPLOYER,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
      phone: "0114727000",
    },
  });

  const empProfile3 = await prisma.employerProfile.upsert({
    where: { userId: empUser3.id },
    update: {},
    create: {
      userId: empUser3.id,
      companyName: "MAS Holdings",
      slug: "mas-holdings",
      about: "South Asia's largest manufacturer of lingerie and apparel products.",
      verificationStatus: "VERIFIED",
      sectorId: apparelSector?.id,
      districtId: colombo?.id,
      address: "No. 10th Floor, Aitken Spence Tower II, 315 Vauxhall Street, Colombo 02",
      companySize: "ENTERPRISE_1000_PLUS",
      website: "https://www.masholdings.com",
    },
  });

  await prisma.employerMember.upsert({
    where: {
      employerId_userId: {
        employerId: empProfile3.id,
        userId: empUser3.id,
      },
    },
    update: {},
    create: {
      employerId: empProfile3.id,
      userId: empUser3.id,
      memberRole: "OWNER",
    },
  });

  console.log("Seeding Candidate Users & Profiles...");

  const candidateData = [
    {
      name: "Nimal Jayawardena",
      email: "nimal@example.com",
      phone: "0771234567",
      headline: "Senior Full Stack Engineer (React / Node / Postgres)",
      districtId: colombo?.id,
      expectedSalaryMin: 350000,
      expectedSalaryMax: 500000,
      experienceYears: 6,
      educationLevel: "BACHELORS" as const,
    },
    {
      name: "Praveen Rathnayake",
      email: "praveen@example.com",
      phone: "0712345678",
      headline: "Associate Software Quality Assurance Engineer",
      districtId: kandy?.id,
      expectedSalaryMin: 120000,
      expectedSalaryMax: 180000,
      experienceYears: 2,
      educationLevel: "BACHELORS" as const,
    },
    {
      name: "Anusha Wickramasinghe",
      email: "anusha@example.com",
      phone: "0763456789",
      headline: "Senior Merchandiser | Apparel & Garments",
      districtId: colombo?.id,
      expectedSalaryMin: 200000,
      expectedSalaryMax: 300000,
      experienceYears: 7,
      educationLevel: "DIPLOMA" as const,
    },
    {
      name: "Mohamed Rilwan",
      email: "rilwan@example.com",
      phone: "0784567890",
      headline: "Financial Analyst & Assistant Accountant (CA / CIMA Qualified)",
      districtId: colombo?.id,
      expectedSalaryMin: 180000,
      expectedSalaryMax: 260000,
      experienceYears: 4,
      educationLevel: "BACHELORS" as const,
    },
    {
      name: "Tharushi Senanayake",
      email: "tharushi@example.com",
      phone: "0725678901",
      headline: "Frontend UI/UX Developer (React & Tailwind)",
      districtId: kandy?.id,
      expectedSalaryMin: 150000,
      expectedSalaryMax: 220000,
      experienceYears: 3,
      educationLevel: "BACHELORS" as const,
    },
  ];

  for (const cand of candidateData) {
    const user = await prisma.user.upsert({
      where: { email: cand.email },
      update: { passwordHash, status: UserStatus.ACTIVE },
      create: {
        email: cand.email,
        name: cand.name,
        passwordHash,
        phone: cand.phone,
        role: UserRole.CANDIDATE,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
      },
    });

    await prisma.candidateProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        headline: cand.headline,
        districtId: cand.districtId,
        phone: cand.phone,
        expectedSalaryMin: cand.expectedSalaryMin,
        expectedSalaryMax: cand.expectedSalaryMax,
        experienceYears: cand.experienceYears,
        educationLevel: cand.educationLevel,
        openToWork: true,
        profileCompleteness: 85,
      },
    });
  }

  return {
    employerProfiles: [empProfile1, empProfile2, empProfile3],
  };
}
