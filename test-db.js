const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log("PostgreSQL connection successful via Prisma.");
  } catch (error) {
    console.error("PostgreSQL connection failed:", error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
