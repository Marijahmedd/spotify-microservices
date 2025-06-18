import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();
export async function dbConnect() {
  try {
    const connection = await prisma.$connect();
    console.log("connection successful");
  } catch (error) {
    console.log("failed connecting to db ", error);
    process.exit(1);
  }
}
dbConnect();
