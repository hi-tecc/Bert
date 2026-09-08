import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ROLES } from "../src/lib/constants";

const prisma = new PrismaClient();

const DOLLARS = (n: number) => Math.round(n * 100);
const thisYear = new Date().getFullYear();
const d = (month: number, day: number) => new Date(thisYear, month - 1, day);

async function main() {
  console.log("Seeding database...");

  // Clear existing data (dev only).
  await prisma.auditLog.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  const shopAdminPassword = await bcrypt.hash("admin123", 10);
  const companyAdminPassword = await bcrypt.hash("company123", 10);

  const shopAdmin = await prisma.user.create({
    data: {
      email: "admin@shop.test",
      name: "Shop Owner",
      passwordHash: shopAdminPassword,
      role: ROLES.SHOP_ADMIN,
    },
  });

  const acme = await prisma.company.create({
    data: {
      name: "Acme Corporation",
      address: "123 Market Street, Springfield",
      contactPerson: "Alice Anderson",
      email: "contact@acme.test",
      phone: "+1 555 0100",
      active: true,
    },
  });

  const globex = await prisma.company.create({
    data: {
      name: "Globex Industries",
      address: "500 Innovation Way, Metropolis",
      contactPerson: "George Green",
      email: "contact@globex.test",
      phone: "+1 555 0200",
      active: true,
    },
  });

  const initech = await prisma.company.create({
    data: {
      name: "Initech LLC",
      address: "77 Office Park, Austin",
      contactPerson: "Bill Lumbergh",
      email: "contact@initech.test",
      phone: "+1 555 0300",
      active: false,
    },
  });

  await prisma.user.create({
    data: {
      email: "acme@company.test",
      name: "Alice Anderson",
      passwordHash: companyAdminPassword,
      role: ROLES.COMPANY_ADMIN,
      companyId: acme.id,
    },
  });

  await prisma.user.create({
    data: {
      email: "globex@company.test",
      name: "George Green",
      passwordHash: companyAdminPassword,
      role: ROLES.COMPANY_ADMIN,
      companyId: globex.id,
    },
  });

  const employees = await Promise.all([
    prisma.employee.create({
      data: {
        companyId: acme.id,
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@acme.test",
        annualBudget: DOLLARS(5000),
      },
    }),
    prisma.employee.create({
      data: {
        companyId: acme.id,
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@acme.test",
        annualBudget: DOLLARS(3000),
      },
    }),
    prisma.employee.create({
      data: {
        companyId: globex.id,
        firstName: "Robert",
        lastName: "Brown",
        email: "robert.brown@globex.test",
        annualBudget: DOLLARS(8000),
      },
    }),
    prisma.employee.create({
      data: {
        companyId: globex.id,
        firstName: "Emily",
        lastName: "Clark",
        email: "emily.clark@globex.test",
        annualBudget: DOLLARS(2000),
      },
    }),
  ]);

  const [john, jane, robert, emily] = employees;

  const purchases: {
    employeeId: string;
    date: Date;
    amount: number;
    description: string;
    notes?: string;
  }[] = [
    // John: ~92% of 5000 -> critical
    { employeeId: john.id, date: d(1, 15), amount: DOLLARS(1200), description: "Laptop stand and monitor" },
    { employeeId: john.id, date: d(3, 3), amount: DOLLARS(1800), description: "Conference tickets", notes: "Annual industry summit" },
    { employeeId: john.id, date: d(6, 20), amount: DOLLARS(1600), description: "Ergonomic chair" },
    // Jane: ~40% of 3000 -> ok
    { employeeId: jane.id, date: d(2, 10), amount: DOLLARS(600), description: "Software licenses" },
    { employeeId: jane.id, date: d(5, 5), amount: DOLLARS(600), description: "Training course" },
    // Robert: ~104% of 8000 -> exceeded
    { employeeId: robert.id, date: d(1, 8), amount: DOLLARS(3500), description: "Workstation upgrade" },
    { employeeId: robert.id, date: d(4, 14), amount: DOLLARS(2900), description: "Travel and lodging" },
    { employeeId: robert.id, date: d(7, 1), amount: DOLLARS(1900), description: "Team offsite" },
    // Emily: ~85% of 2000 -> warning
    { employeeId: emily.id, date: d(2, 2), amount: DOLLARS(900), description: "Design software subscription" },
    { employeeId: emily.id, date: d(8, 18), amount: DOLLARS(800), description: "Tablet and accessories" },
  ];

  for (const p of purchases) {
    await prisma.purchase.create({
      data: { ...p, createdById: shopAdmin.id },
    });
  }

  console.log("Seed complete.");
  console.log("  Shop admin:    admin@shop.test / admin123");
  console.log("  Company admin: acme@company.test / company123");
  console.log("  Company admin: globex@company.test / company123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
