const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function upsertUser(email, name, role) {
  const hashed = await bcrypt.hash("password123", 10);
  return prisma.user.upsert({
    where: { email },
    update: { name, role, password: hashed },
    create: { email, name, role, password: hashed },
  });
}

async function main() {
  await upsertUser("admin@test.com", "System Admin", "ADMIN");
  await upsertUser("cleaner1@test.com", "Cleaner One", "CLEANER");
  await upsertUser("cleaner2@test.com", "Cleaner Two", "CLEANER");
  await upsertUser("student@test.com", "Student User", "STUDENT");
  console.log("Seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
